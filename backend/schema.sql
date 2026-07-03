-- ============================================================================
--  MEC Eatz — database schema & secure server-side operations
-- ----------------------------------------------------------------------------
--  Run this once against your Supabase project (SQL editor or `psql`).
--  It is idempotent: safe to re-run.
--
--  Design notes
--  * Prices, wallet balances and the transaction ledger are NEVER trusted from
--    the client. Every money-moving operation runs inside a SECURITY DEFINER
--    Postgres function so the balance check + debit + ledger insert are atomic
--    (no double-spend under concurrent requests — the user row is locked with
--    `FOR UPDATE`).
--  * `Transaction_History` is the per-user ledger. `type` distinguishes wallet
--    top-ups (credits) from orders (debits); `Users.balance` is the authoritative
--    running balance kept in sync by these functions.
--  * Orders carry a 6-digit `pickup_code` used for QR-code pickup verification
--    at the counter.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists "Users" (
  id         uuid primary key,               -- matches Supabase auth user id
  name       text,
  email      text,
  balance    numeric(10, 2) not null default 0,
  role       text           not null default 'student',  -- 'student' | 'staff'
  created_at timestamptz    not null default now()
);

create table if not exists "Items" (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null,
  price       numeric(10, 2) not null,
  available   boolean not null default true,
  description text
);

create table if not exists "Transaction_History" (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references "Users"(id) on delete cascade,
  type        text not null default 'ORDER',      -- 'ORDER' | 'TOPUP'
  price       numeric(10, 2) not null,            -- always positive
  status      text not null default 'pending',    -- 'pending' | 'completed' | 'cancelled'
  pickup_code text,
  created_at  timestamptz not null default now()
);

create table if not exists "Transaction_Items" (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid references "Transaction_History"(id) on delete cascade,
  item_id        uuid references "Items"(id),
  quantity       int not null default 1,
  price          numeric(10, 2) not null           -- unit price snapshot at order time
);

-- Bring existing installs up to date (no-ops if already present)
alter table "Users"               add column if not exists balance     numeric(10, 2) not null default 0;
alter table "Users"               add column if not exists role        text not null default 'student';
alter table "Users"               add column if not exists email       text;
alter table "Transaction_History" add column if not exists type        text not null default 'ORDER';
alter table "Transaction_History" add column if not exists status      text not null default 'pending';
alter table "Transaction_History" add column if not exists pickup_code text;
alter table "Transaction_Items"   add column if not exists quantity    int not null default 1;
alter table "Transaction_Items"   add column if not exists price       numeric(10, 2) not null default 0;

create index if not exists idx_txn_user       on "Transaction_History"(user_id);
create index if not exists idx_txn_pickup     on "Transaction_History"(pickup_code);
create index if not exists idx_txn_items_txn  on "Transaction_Items"(transaction_id);

-- ---------------------------------------------------------------------------
-- wallet_topup(user, amount) — atomic prepaid-wallet credit + ledger entry
-- ---------------------------------------------------------------------------
create or replace function wallet_topup(p_user_id uuid, p_amount numeric)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Top-up amount must be positive';
  end if;

  update "Users"
     set balance = balance + p_amount
   where id = p_user_id
  returning balance into v_balance;

  if v_balance is null then
    raise exception 'User not found';
  end if;

  insert into "Transaction_History"(user_id, type, price, status)
  values (p_user_id, 'TOPUP', p_amount, 'completed');

  return jsonb_build_object('balance', v_balance);
end;
$$;

-- ---------------------------------------------------------------------------
-- place_order(user, items) — atomic: price the cart server-side, check the
-- wallet, debit it, write the order + line items, mint a pickup code.
--   p_items = '[{"item_id":"<uuid>","quantity":2}, ...]'
-- ---------------------------------------------------------------------------
create or replace function place_order(p_user_id uuid, p_items jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total    numeric := 0;
  v_balance  numeric;
  v_order_id uuid;
  v_code     text;
  v_item     jsonb;
  v_price    numeric;
  v_qty      int;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- 1. Price the cart from the Items table — client prices are ignored.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := coalesce((v_item ->> 'quantity')::int, 1);
    if v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;
    select price into v_price
      from "Items"
     where id = (v_item ->> 'item_id')::uuid and available = true;
    if v_price is null then
      raise exception 'Item % is unavailable', (v_item ->> 'item_id');
    end if;
    v_total := v_total + v_price * v_qty;
  end loop;

  -- 2. Lock the wallet row and verify funds.
  select balance into v_balance from "Users" where id = p_user_id for update;
  if v_balance is null then
    raise exception 'User not found';
  end if;
  if v_balance < v_total then
    raise exception 'Insufficient wallet balance';
  end if;

  -- 3. Debit the wallet.
  update "Users" set balance = balance - v_total where id = p_user_id;

  -- 4. Create the order (pending pickup) with a 6-digit pickup code.
  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  insert into "Transaction_History"(user_id, type, price, status, pickup_code)
  values (p_user_id, 'ORDER', v_total, 'pending', v_code)
  returning id into v_order_id;

  -- 5. Snapshot the line items.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := coalesce((v_item ->> 'quantity')::int, 1);
    select price into v_price from "Items" where id = (v_item ->> 'item_id')::uuid;
    insert into "Transaction_Items"(transaction_id, item_id, quantity, price)
    values (v_order_id, (v_item ->> 'item_id')::uuid, v_qty, v_price);
  end loop;

  return jsonb_build_object(
    'order_id',    v_order_id,
    'total',       v_total,
    'pickup_code', v_code,
    'balance',     v_balance - v_total
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- verify_pickup(code) — staff scans/enters the code; the matching pending
-- order is marked completed. Returns the order so the counter can hand it over.
-- ---------------------------------------------------------------------------
create or replace function verify_pickup(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order "Transaction_History"%rowtype;
begin
  select * into v_order
    from "Transaction_History"
   where pickup_code = p_code and type = 'ORDER' and status = 'pending'
   order by created_at desc
   limit 1;

  if not found then
    raise exception 'Invalid or already-used pickup code';
  end if;

  update "Transaction_History" set status = 'completed' where id = v_order.id;

  return jsonb_build_object(
    'order_id', v_order.id,
    'user_id',  v_order.user_id,
    'total',    v_order.price,
    'status',   'completed'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- staff_analytics() — real-time sales dashboard numbers for canteen staff.
-- ---------------------------------------------------------------------------
create or replace function staff_analytics()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total_revenue numeric;
  v_total_orders  int;
  v_today_revenue numeric;
  v_top           jsonb;
begin
  select coalesce(sum(price), 0), count(*)
    into v_total_revenue, v_total_orders
    from "Transaction_History"
   where type = 'ORDER' and status <> 'cancelled';

  select coalesce(sum(price), 0)
    into v_today_revenue
    from "Transaction_History"
   where type = 'ORDER' and status <> 'cancelled'
     and created_at >= date_trunc('day', now());

  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_top from (
    select i.name,
           sum(ti.quantity)             as quantity,
           sum(ti.quantity * ti.price)  as revenue
      from "Transaction_Items" ti
      join "Items" i on i.id = ti.item_id
     group by i.name
     order by quantity desc
     limit 5
  ) t;

  return jsonb_build_object(
    'total_revenue', v_total_revenue,
    'total_orders',  v_total_orders,
    'today_revenue', v_today_revenue,
    'top_items',     v_top
  );
end;
$$;
