import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Calendar,
  Layers,
  CircleDollarSign,
  TrendingUp,
  Wallet,
  ArrowRight,
  ArrowLeft,
} from "lucide-react-native";
import { fetchMobileHalKhataData, MobileFinancials, MobileStockItem } from "../services/sheetsDirect";
import { OfflineDB } from "../services/offlineStorage";

interface Props {
  userRole: "admin" | "manager" | "viewer";
}

export default function HalKhataScreen({ userRole }: Props) {
  const [selectedDate, setSelectedDate] = useState("2026-09-07");
  const [financials, setFinancials] = useState<MobileFinancials | null>(null);
  const [stock, setStock] = useState<MobileStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHalKhata = async (dStr: string) => {
    try {
      setLoading(true);
      const res = await fetchMobileHalKhataData(dStr);
      setFinancials(res.financials);
      setStock(res.stock);
      await OfflineDB.cacheHalKhata(dStr, res);
    } catch (err) {
      console.warn("Falling back to local Hal Khata cache:", err);
      const cached = await OfflineDB.getCachedHalKhata(dStr);
      if (cached) {
        setFinancials(cached.financials);
        setStock(cached.stock);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHalKhata(selectedDate);
  }, [selectedDate]);

  // Financial Calculations matching web app formulas
  const totalStockValue = stock.reduce((sum, it) => sum + (it.amount || 0), 0);
  const totalDue = (financials?.totalDue || 0) + (financials?.extraDue || 0);
  const totalCash = financials?.totalCash || 0;
  const totalReceivables = totalDue + totalCash + totalStockValue; // Matches Google Sheet B25
  const totalLiability = (financials?.prevDayBalance || 0) + (financials?.providerDueMoney || 0); // Matches E24
  const netMargin = totalReceivables - totalLiability; // Matches G5

  const formatDateDisplay = (isoStr: string) => {
    const parts = isoStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoStr;
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newStr = d.toISOString().split("T")[0];
    setSelectedDate(newStr);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHalKhata(selectedDate)} tintColor="#d97706" />}
    >
      {/* Date Switcher */}
      <View style={styles.dateBar}>
        <TouchableOpacity style={styles.dateArrow} onPress={() => shiftDate(-1)}>
          <ArrowLeft size={16} color="#cbd5e1" />
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Calendar size={16} color="#d97706" />
          <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
          <Text style={styles.dayText}>{financials?.day || "সোমবার"}</Text>
        </View>
        <TouchableOpacity style={styles.dateArrow} onPress={() => shiftDate(1)}>
          <ArrowRight size={16} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Top 3 Metric Badges */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: "rgba(59, 130, 246, 0.3)" }]}>
          <Text style={styles.summaryLabel}>নগদ ক্যাশ (Cash)</Text>
          <Text style={[styles.summaryValue, { color: "#60a5fa" }]}>
            ৳ {totalCash.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, { borderColor: "rgba(245, 158, 11, 0.3)" }]}>
          <Text style={styles.summaryLabel}>মজুদ ডিম মূল্য</Text>
          <Text style={[styles.summaryValue, { color: "#fbbf24" }]}>
            ৳ {totalStockValue.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.summaryCard, { borderColor: "rgba(16, 185, 129, 0.3)" }]}>
          <Text style={styles.summaryLabel}>নিট প্রফিট মার্জিন</Text>
          <Text style={[styles.summaryValue, { color: "#34d399" }]}>
            ৳ {netMargin.toLocaleString()}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#d97706" style={{ marginVertical: 30 }} />
      ) : (
        <>
          {/* Stock Table Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Layers size={18} color="#fbbf24" />
              <Text style={styles.sectionTitle}>১. ডিমের মজুদ ও স্টক খাতা (Stock Inventory)</Text>
            </View>

            {stock.length === 0 ? (
              <Text style={styles.emptyText}>এই তারিখের কোনো স্টক পাওয়া যায়নি।</Text>
            ) : (
              stock.map((it, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={styles.tableColMain}>
                    <Text style={styles.eggName}>{it.name}</Text>
                    <Text style={styles.eggSub}>রেট: ৳ {it.rate} | পরিমাণ: {it.piece.toLocaleString()} পিস</Text>
                  </View>
                  <Text style={styles.eggAmount}>৳ {it.amount.toLocaleString()}</Text>
                </View>
              ))
            )}

            <View style={styles.tableFooter}>
              <Text style={styles.footerLabel}>সর্বমোট মজুদ ডিমের মূল্য:</Text>
              <Text style={styles.footerValue}>৳ {totalStockValue.toLocaleString()}</Text>
            </View>
          </View>

          {/* Financials Ledger Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <CircleDollarSign size={18} color="#38bdf8" />
              <Text style={styles.sectionTitle}>২. খাত ও হিসাব খতিয়ান (Financials Ledger)</Text>
            </View>

            <View style={styles.finRow}>
              <Text style={styles.finLabel}>বাকি (Customer Due):</Text>
              <Text style={styles.finValue}>৳ {(financials?.totalDue || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>নগদ ক্যাশ (Cash in Hand):</Text>
              <Text style={[styles.finValue, { color: "#60a5fa" }]}>৳ {totalCash.toLocaleString()}</Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>অতিরিক্ত বাকি (Extra Due):</Text>
              <Text style={styles.finValue}>৳ {(financials?.extraDue || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.finRow, styles.finHighlight]}>
              <Text style={styles.finHighlightLabel}>সর্বমোট পাওনা/হিসাব (Total):</Text>
              <Text style={styles.finHighlightValue}>৳ {totalReceivables.toLocaleString()}</Text>
            </View>

            <View style={[styles.finRow, { marginTop: 10 }]}>
              <Text style={styles.finLabel}>সাবেক দেনা (Opening Balance):</Text>
              <Text style={styles.finValue}>৳ {(financials?.prevDayBalance || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.finRow}>
              <Text style={styles.finLabel}>মহাজন দেনা (Supplier Due):</Text>
              <Text style={styles.finValue}>৳ {(financials?.providerDueMoney || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.finRow, styles.finHighlight, { borderLeftColor: "#f87171" }]}>
              <Text style={styles.finHighlightLabel}>মোট দেনা/দায় (Liability):</Text>
              <Text style={[styles.finHighlightValue, { color: "#f87171" }]}>৳ {totalLiability.toLocaleString()}</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  dateBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#131b2e",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  dateArrow: {
    padding: 8,
    backgroundColor: "#0f172a",
    borderRadius: 10,
  },
  dateCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
  },
  dayText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#131b2e",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#131b2e",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 12,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  tableColMain: {
    flex: 1,
  },
  eggName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f8fafc",
  },
  eggSub: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  eggAmount: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fbbf24",
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#cbd5e1",
  },
  footerValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fbbf24",
  },
  finRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  finLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
  finValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f8fafc",
  },
  finHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
  },
  finHighlightLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  finHighlightValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#38bdf8",
  },
});
