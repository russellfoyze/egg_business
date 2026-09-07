import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import {
  PiggyBank,
  Users,
  Receipt,
  Store,
  Wallet,
  Plus,
  Trash2,
  RefreshCw,
  Landmark,
  Building2,
  Zap,
  CheckCircle2,
} from "lucide-react-native";
import {
  fetchMobileOverheadExpenses,
  addMobileOverheadExpense,
  MobileOverheadItem,
} from "../services/sheetsDirect";
import { OfflineDB } from "../services/offlineStorage";

interface Props {
  userRole: "admin" | "manager" | "viewer";
}

export default function OverheadScreen({ userRole }: Props) {
  const [items, setItems] = useState<MobileOverheadItem[]>([]);
  const [latestShopCash, setLatestShopCash] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState("savings_shop");
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMode, setFormPaymentMode] = useState<MobileOverheadItem["paymentMode"]>("cash");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await fetchMobileOverheadExpenses();
      setItems(res.items);
      setLatestShopCash(res.latestShopCash);
      await OfflineDB.cacheOverheadExpenses(res.items);
    } catch (err) {
      console.warn("Falling back to local cache:", err);
      const cached = await OfflineDB.getCachedOverheadExpenses();
      if (cached && cached.length > 0) setItems(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregated Totals matching the Web App logic
  const totals = useMemo(() => {
    let employeeTotal = 0;
    let rentTotal = 0;
    let utilitiesTotal = 0;
    let extraTotal = 0;
    let savingsShopTotal = 0;
    let savingsShopBillTotal = 0;
    let savingsBankTotal = 0;
    let savingsBankBillTotal = 0;
    let grandTotal = 0;

    items.forEach((it) => {
      const amt = Number(it.amount) || 0;
      grandTotal += amt;

      const isPaidFromShop = (it.paymentMode === "savings_shop" && it.category !== "savings_shop") || it.category === "bill_from_savings_shop";
      const isPaidFromBank = (it.paymentMode === "savings_bank" && it.category !== "savings_bank") || it.category === "bill_from_savings_bank";

      if (isPaidFromShop) savingsShopBillTotal += amt;
      if (isPaidFromBank) savingsBankBillTotal += amt;

      if (it.category === "savings_shop") savingsShopTotal += amt;
      else if (it.category === "savings_bank") savingsBankTotal += amt;
      else if (it.category === "employee") employeeTotal += amt;
      else if (it.category === "rent") rentTotal += amt;
      else if (it.category === "utilities") utilitiesTotal += amt;
      else extraTotal += amt;
    });

    const netShopSavings = savingsShopTotal - savingsShopBillTotal;
    const netBankSavings = savingsBankTotal - savingsBankBillTotal;
    const totalSavingsDeposited = savingsShopTotal + savingsBankTotal;
    const totalSavingsWithdrawn = savingsShopBillTotal + savingsBankBillTotal;
    const netTotalSavings = netShopSavings + netBankSavings;
    const pureExpenseTotal = Math.max(0, grandTotal - totalSavingsDeposited);

    return {
      employeeTotal,
      rentTotal,
      utilitiesTotal,
      extraTotal,
      savingsShopTotal,
      savingsShopBillTotal,
      netShopSavings,
      savingsBankTotal,
      savingsBankBillTotal,
      netBankSavings,
      totalSavingsDeposited,
      totalSavingsWithdrawn,
      netTotalSavings,
      pureExpenseTotal,
      grandTotal,
      count: items.length,
    };
  }, [items]);

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formAmount || Number(formAmount) <= 0) {
      Alert.alert("ত্রুটি", "অনুগ্রহ করে বিবরণ ও সঠিক টাকার পরিমাণ দিন।");
      return;
    }

    setSubmitting(true);
    const newItem: MobileOverheadItem = {
      id: `exp-${Date.now()}`,
      date: formDate,
      month: formDate.slice(0, 7),
      category: formCategory,
      title: formTitle.trim(),
      amount: Number(formAmount),
      paymentMode: formPaymentMode,
      notes: formNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addMobileOverheadExpense(newItem);
      setItems((prev) => [newItem, ...prev]);
      setFormTitle("");
      setFormAmount("");
      setFormNotes("");
      setIsFormOpen(false);
      Alert.alert("সফল", "খরচ/সঞ্চয়ের এন্ট্রি সরাসরি গুগল শিটে সংরক্ষিত হয়েছে!");
    } catch (err: any) {
      Alert.alert("সংরক্ষণ হয়েছে (অফলাইন)", "ইন্টারনেট না থাকায় অফলাইনে সংরক্ষণ করা হয়েছে। ক্লাউডে পরে সিঙ্ক হবে।");
      await OfflineDB.enqueueAction({ type: "overhead_expense", payload: newItem });
      setItems((prev) => [newItem, ...prev]);
      setIsFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateBangla = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#d97706" />}
    >
      {/* Action Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>কর্মচারী ও মাসিক খরচ</Text>
          <Text style={styles.topBarSub}>ব্যবসায়িক সঞ্চয় ও পরিচালন ব্যয় খতিয়ান</Text>
        </View>
        <TouchableOpacity
          style={styles.newEntryBtn}
          onPress={() => setIsFormOpen(!isFormOpen)}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.newEntryBtnText}>{isFormOpen ? "ফর্ম লুকান" : "+ নতুন খরচ"}</Text>
        </TouchableOpacity>
      </View>

      {/* 4 TOP SUMMARY METRIC CARDS */}
      <View style={styles.metricGrid}>
        {/* Card 1: Total Savings Given */}
        <View style={[styles.metricCard, styles.cardGreen]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.2)" }]}>
              <PiggyBank size={18} color="#10b981" />
            </View>
            <View style={styles.cardBadgeGreen}>
              <Text style={styles.cardBadgeTextGreen}>দোকান + ব্যাংক</Text>
            </View>
          </View>
          <Text style={styles.metricLabel}>মোট সঞ্চয় জমা (Savings)</Text>
          <Text style={[styles.metricValue, { color: "#34d399" }]}>
            ৳ {totals.totalSavingsDeposited.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>দোকানে ৳{totals.savingsShopTotal.toLocaleString()} | ব্যাংকে ৳{totals.savingsBankTotal.toLocaleString()}</Text>
        </View>

        {/* Card 2: Employee Salary */}
        <View style={[styles.metricCard, styles.cardBlue]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
              <Users size={18} color="#3b82f6" />
            </View>
            <View style={styles.cardBadgeBlue}>
              <Text style={styles.cardBadgeTextBlue}>বেতন ও মজুরি</Text>
            </View>
          </View>
          <Text style={styles.metricLabel}>কর্মচারী মোট বেতন</Text>
          <Text style={[styles.metricValue, { color: "#60a5fa" }]}>
            ৳ {totals.employeeTotal.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>হাজিরা ও নিয়মিত কর্মচারী খরচ</Text>
        </View>

        {/* Card 3: Total Monthly Cost */}
        <View style={[styles.metricCard, styles.cardAmber]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.2)" }]}>
              <Receipt size={18} color="#f59e0b" />
            </View>
            <View style={styles.cardBadgeAmber}>
              <Text style={styles.cardBadgeTextAmber}>{totals.count} টি এন্ট্রি</Text>
            </View>
          </View>
          <Text style={styles.metricLabel}>সর্বমোট মাসিক খরচ</Text>
          <Text style={[styles.metricValue, { color: "#fbbf24" }]}>
            ৳ {totals.pureExpenseTotal.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>বেতন, ভাড়া ও বিল সহ</Text>
        </View>

        {/* Card 4: Cash in Shop */}
        <View style={[styles.metricCard, styles.cardHighlight]}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}>
              <Store size={18} color="#ffffff" />
            </View>
            <View style={styles.cardBadgeWhite}>
              <Text style={styles.cardBadgeTextWhite}>ক্যাশ ড্রয়ার</Text>
            </View>
          </View>
          <Text style={[styles.metricLabel, { color: "#fed7aa" }]}>দোকানের নগদ ক্যাশ</Text>
          <Text style={[styles.metricValue, { color: "#ffffff" }]}>
            ৳ {(latestShopCash > 0 ? latestShopCash : totals.netShopSavings).toLocaleString()}
          </Text>
          <Text style={[styles.metricSub, { color: "rgba(255, 255, 255, 0.8)" }]}>
            দোকানে সঞ্চয়: ৳{totals.netShopSavings.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* 2-PART DEDICATED SAVINGS SECTION */}
      <View style={styles.savingsSection}>
        <View style={styles.savingsSectionHeader}>
          <Wallet size={20} color="#10b981" />
          <Text style={styles.savingsSectionTitle}>ব্যবসায়িক সঞ্চয় ও তহবিল (Business Savings)</Text>
        </View>

        <View style={styles.savingsGrid}>
          {/* Part 1: Shop Savings */}
          <View style={styles.savingsBox}>
            <Text style={styles.savingsBoxTitle}>🏪 সমিতি / দোকানে সঞ্চয়</Text>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsRowLabel}>মোট জমা:</Text>
              <Text style={[styles.savingsRowValue, { color: "#34d399" }]}>৳ {totals.savingsShopTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsRowLabel}>বিল পরিশোধ:</Text>
              <Text style={[styles.savingsRowValue, { color: "#f87171" }]}>- ৳ {totals.savingsShopBillTotal.toLocaleString()}</Text>
            </View>
            <View style={[styles.savingsRow, styles.savingsDivider]}>
              <Text style={styles.savingsNetLabel}>অবশিষ্ট নিট:</Text>
              <Text style={styles.savingsNetValue}>৳ {totals.netShopSavings.toLocaleString()}</Text>
            </View>
          </View>

          {/* Part 2: Bank Savings */}
          <View style={styles.savingsBox}>
            <Text style={styles.savingsBoxTitle}>🏦 ব্যাংকে সঞ্চয় / DPS</Text>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsRowLabel}>মোট জমা:</Text>
              <Text style={[styles.savingsRowValue, { color: "#60a5fa" }]}>৳ {totals.savingsBankTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsRowLabel}>বিল পরিশোধ:</Text>
              <Text style={[styles.savingsRowValue, { color: "#f87171" }]}>- ৳ {totals.savingsBankBillTotal.toLocaleString()}</Text>
            </View>
            <View style={[styles.savingsRow, styles.savingsDivider]}>
              <Text style={styles.savingsNetLabel}>অবশিষ্ট ব্যাংক:</Text>
              <Text style={[styles.savingsNetValue, { color: "#60a5fa" }]}>৳ {totals.netBankSavings.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* INPUT FORM (When Open) */}
      {isFormOpen && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>নতুন খরচ ও সঞ্চয় এন্ট্রি</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>বিবরণ / নাম *</Text>
            <TextInput
              style={styles.textInput}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="যেমন: সালাউদ্দিন (বেতন), দোকান ভাড়া..."
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>টাকার পরিমাণ (৳) *</Text>
            <TextInput
              style={[styles.textInput, { fontWeight: "800", color: "#fbbf24" }]}
              value={formAmount}
              onChangeText={setFormAmount}
              placeholder="0.00"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>

          {/* Payment Mode Selector with Savings Cut Options */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>পেমেন্ট মাধ্যম (Payment Mode)</Text>
            <View style={styles.paymentPills}>
              <TouchableOpacity
                style={[styles.pill, formPaymentMode === "cash" && styles.pillActive]}
                onPress={() => setFormPaymentMode("cash")}
              >
                <Text style={[styles.pillText, formPaymentMode === "cash" && styles.pillTextActive]}>💵 নগদ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pill, formPaymentMode === "mfs" && styles.pillActive]}
                onPress={() => setFormPaymentMode("mfs")}
              >
                <Text style={[styles.pillText, formPaymentMode === "mfs" && styles.pillTextActive]}>📱 বিকাশ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pill, formPaymentMode === "savings_shop" && styles.pillActiveGreen]}
                onPress={() => setFormPaymentMode("savings_shop")}
              >
                <Text style={[styles.pillText, formPaymentMode === "savings_shop" && styles.pillTextActive]}>🏪 দোকানে সঞ্চয় কর্তন</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pill, formPaymentMode === "savings_bank" && styles.pillActiveBlue]}
                onPress={() => setFormPaymentMode("savings_bank")}
              >
                <Text style={[styles.pillText, formPaymentMode === "savings_bank" && styles.pillTextActive]}>🏦 ব্যাংকে সঞ্চয় কর্তন</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>গুগল শিটে সংরক্ষণ করুন</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ITEMIZED EXPENSES LIST */}
      <View style={styles.listContainer}>
        <Text style={styles.listHeaderTitle}>খরচের তালিকা (আইটেম অনুযায়ী খাতা)</Text>

        {loading ? (
          <ActivityIndicator color="#d97706" style={{ marginVertical: 20 }} />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>কোনো খরচের রেকর্ড পাওয়া যায়নি।</Text>
        ) : (
          items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDate}>{formatDateBangla(it.date)}</Text>
                <Text style={styles.itemTitle}>{it.title}</Text>
                <View style={styles.itemBadgeRow}>
                  {it.paymentMode === "savings_shop" ? (
                    <Text style={styles.badgeSavingsShop}>🏪 দোকানে সঞ্চয় কর্তন</Text>
                  ) : it.paymentMode === "savings_bank" ? (
                    <Text style={styles.badgeSavingsBank}>🏦 ব্যাংকে সঞ্চয় কর্তন</Text>
                  ) : (
                    <Text style={styles.badgeRegular}>{it.paymentMode === "cash" ? "💵 নগদ" : "📱 বিকাশ/ব্যাংক"}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemAmount}>৳ {it.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#f8fafc",
  },
  topBarSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  newEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d97706",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  newEntryBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#131b2e",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardGreen: {
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  cardBlue: {
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  cardAmber: {
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  cardHighlight: {
    backgroundColor: "#b45309",
    borderColor: "#d97706",
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    padding: 6,
    borderRadius: 10,
  },
  cardBadgeGreen: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeTextGreen: {
    fontSize: 9,
    fontWeight: "700",
    color: "#34d399",
  },
  cardBadgeBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeTextBlue: {
    fontSize: 9,
    fontWeight: "700",
    color: "#60a5fa",
  },
  cardBadgeAmber: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeTextAmber: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fbbf24",
  },
  cardBadgeWhite: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeTextWhite: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
  },
  metricLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 9,
    color: "#64748b",
  },
  savingsSection: {
    backgroundColor: "#0d1b1e",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    marginBottom: 16,
  },
  savingsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  savingsSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#34d399",
  },
  savingsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  savingsBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  savingsBoxTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 8,
  },
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  savingsRowLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
  savingsRowValue: {
    fontSize: 11,
    fontWeight: "700",
  },
  savingsDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 6,
    marginTop: 4,
  },
  savingsNetLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  savingsNetValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#34d399",
  },
  formContainer: {
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: "#cbd5e1",
    fontWeight: "700",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  paymentPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  pillActive: {
    backgroundColor: "#d97706",
  },
  pillActiveGreen: {
    backgroundColor: "#059669",
  },
  pillActiveBlue: {
    backgroundColor: "#2563eb",
  },
  pillText: {
    fontSize: 11,
    color: "#cbd5e1",
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  submitBtn: {
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  listContainer: {
    backgroundColor: "#131b2e",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 12,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  itemLeft: {
    flex: 1,
  },
  itemDate: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: 2,
  },
  itemBadgeRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  badgeSavingsShop: {
    fontSize: 9,
    color: "#34d399",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "700",
  },
  badgeSavingsBank: {
    fontSize: 9,
    color: "#60a5fa",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "700",
  },
  badgeRegular: {
    fontSize: 9,
    color: "#94a3b8",
    backgroundColor: "#1e293b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "600",
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "900",
    color: "#fbbf24",
    marginLeft: 12,
  },
});
