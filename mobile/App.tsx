import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { BookOpen, DollarSign, Camera, LogOut, RefreshCw, Shield } from "lucide-react-native";
import LoginScreen from "./src/screens/LoginScreen";
import HalKhataScreen from "./src/screens/HalKhataScreen";
import OverheadScreen from "./src/screens/OverheadScreen";
import OcrScannerScreen from "./src/screens/OcrScannerScreen";
import { OfflineDB } from "./src/services/offlineStorage";

type TabType = "halkhata" | "overhead" | "ocr";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: "admin" | "manager" | "viewer";
    name: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("overhead");
  const [syncing, setSyncing] = useState(false);

  // Restore session
  useEffect(() => {
    (async () => {
      const saved = await OfflineDB.getUser();
      if (saved) setCurrentUser(saved);
    })();
  }, []);

  const handleLogout = async () => {
    await OfflineDB.clearUser();
    setCurrentUser(null);
  };

  const handleLoginSuccess = async (user: {
    username: string;
    role: "admin" | "manager" | "viewer";
    name: string;
  }) => {
    await OfflineDB.saveUser(user);
    setCurrentUser(user);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#090d16" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Top Mobile App Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandLetter}>M</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>M.A Khalek Sarker</Text>
            <View style={styles.roleRow}>
              <View style={styles.syncDot} />
              <Text style={styles.brandRoleText}>
                {currentUser.role === "admin"
                  ? "এডমিন (পূর্ণ নিয়ন্ত্রণ)"
                  : currentUser.role === "manager"
                  ? "ম্যানেজার (এন্ট্রি)"
                  : "ভিউয়ার (রিড-অনলি)"}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} title="লগআউট">
          <LogOut size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Main Tab Screen Body */}
      <View style={styles.body}>
        {activeTab === "halkhata" && <HalKhataScreen userRole={currentUser.role} />}
        {activeTab === "overhead" && <OverheadScreen userRole={currentUser.role} />}
        {activeTab === "ocr" && <OcrScannerScreen />}
      </View>

      {/* Bottom Modern Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navTab, activeTab === "overhead" && styles.navTabActive]}
          onPress={() => setActiveTab("overhead")}
        >
          <DollarSign size={20} color={activeTab === "overhead" ? "#fbbf24" : "#64748b"} />
          <Text style={[styles.navLabel, activeTab === "overhead" && styles.navLabelActive]}>
            খরচ ও সঞ্চয়
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === "halkhata" && styles.navTabActive]}
          onPress={() => setActiveTab("halkhata")}
        >
          <BookOpen size={20} color={activeTab === "halkhata" ? "#fbbf24" : "#64748b"} />
          <Text style={[styles.navLabel, activeTab === "halkhata" && styles.navLabelActive]}>
            দৈনিক হালখাতা
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeTab === "ocr" && styles.navTabActive]}
          onPress={() => setActiveTab("ocr")}
        >
          <Camera size={20} color={activeTab === "ocr" ? "#fbbf24" : "#64748b"} />
          <Text style={[styles.navLabel, activeTab === "ocr" && styles.navLabelActive]}>
            AI স্ক্যানার
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLetter: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  brandRoleText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: "#1e293b",
    borderRadius: 10,
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingVertical: 8,
    paddingBottom: 14,
    justifyContent: "space-around",
  },
  navTab: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navTabActive: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 4,
  },
  navLabelActive: {
    color: "#fbbf24",
  },
});
