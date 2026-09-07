import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Lock, User, CheckCircle2, Shield } from "lucide-react-native";

interface Props {
  onLoginSuccess: (user: { username: string; role: "admin" | "manager" | "viewer"; name: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (user?: string, pass?: string) => {
    const u = (user || username).trim().toLowerCase();
    const p = (pass || password).trim();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (u === "russellfoyze" && p === "admin123") {
        onLoginSuccess({ username: "russellfoyze", role: "admin", name: "রাসেল ফয়েজ (মালিক / এডমিন)" });
      } else if (u === "billal" && p === "billal123") {
        onLoginSuccess({ username: "billal", role: "manager", name: "বিল্লাল (ম্যানেজার)" });
      } else if (u === "juel" && p === "juel123") {
        onLoginSuccess({ username: "juel", role: "viewer", name: "জুয়েল (দর্শক / ভিউয়ার)" });
      } else {
        setError("ভুল ইউজারনেম অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Branding Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.title}>M.A Khalek Sarker</Text>
          <Text style={styles.subtitle}>ডিম ব্যবসায়ী হালখাতা ও পরিচালন খতিয়ান</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>অ্যান্ড্রয়েড মোবাইল অ্যাপ v1.0 • ক্লাউড সিঙ্ক</Text>
          </View>
        </View>

        {/* Login Form Box */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>লগইন করুন</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ইউজারনেম</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="যেমন: russellfoyze, billal..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>পাসওয়ার্ড</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="পাসওয়ার্ড লিখুন..."
                placeholderTextColor="#64748b"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => handleLogin()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>লগইন (Sign In)</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Credentials */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>এক-ক্লিকে দ্রুত লগইন নির্বাচন করুন:</Text>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={[styles.quickButton, styles.quickAdmin]}
                onPress={() => handleLogin("russellfoyze", "admin123")}
              >
                <Text style={styles.quickButtonText}>এডমিন (রাসেল)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, styles.quickManager]}
                onPress={() => handleLogin("billal", "billal123")}
              >
                <Text style={styles.quickButtonText}>ম্যানেজার (বিল্লাল)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, styles.quickViewer]}
                onPress={() => handleLogin("juel", "juel123")}
              >
                <Text style={styles.quickButtonText}>ভিউয়ার (জুয়েল)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#d97706",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: "900",
    color: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "600",
  },
  versionBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(217, 119, 6, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  versionText: {
    fontSize: 11,
    color: "#fbbf24",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#131b2e",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 14,
    paddingVertical: 12,
  },
  loginButton: {
    backgroundColor: "#d97706",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  quickAccessSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 16,
  },
  quickAccessTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  quickAdmin: {
    backgroundColor: "rgba(217, 119, 6, 0.15)",
    borderColor: "rgba(217, 119, 6, 0.4)",
  },
  quickManager: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  quickViewer: {
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    borderColor: "rgba(100, 116, 139, 0.4)",
  },
  quickButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#cbd5e1",
  },
});
