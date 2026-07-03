import { apiFetch } from "@/constants/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Txn = {
  id: string;
  type: "ORDER" | "TOPUP";
  price: number;
  status: string;
  created_at: string;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const TransactionItem = ({ type, price, status, created_at }: Txn) => {
  const isCredit = type === "TOPUP";
  const label = isCredit ? "Wallet Top-up" : "Canteen Order";
  const sign = isCredit ? "+" : "−";
  const amountColor = isCredit ? "#16a34a" : "#dc2626";

  return (
    <View style={styles.itemContainer}>
      <View style={styles.leftContent}>
        <Text style={styles.nameText}>{label}</Text>
        <Text style={styles.dateText}>{formatDate(created_at)}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={[styles.priceText, { color: amountColor }]}>
          {sign}₹{Number(price).toFixed(2)}
        </Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/orders");
        if (!data.success) {
          setError(data.message || "Failed to fetch transactions.");
          return;
        }
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load transaction history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10 }}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "#dc2626" }}>{error}</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No transaction history found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>
      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionItem {...item} />}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  leftContent: { flex: 1 },
  rightContent: { marginLeft: 10, alignItems: "flex-end" },
  nameText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dateText: { fontSize: 14, color: "#888", marginTop: 2 },
  priceText: { fontSize: 18, fontWeight: "bold" },
  statusText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    textTransform: "capitalize",
  },
  separator: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 15 },
});

export default TransactionHistory;
