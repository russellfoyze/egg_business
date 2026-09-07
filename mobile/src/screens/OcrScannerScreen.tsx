import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Camera, Image as ImageIcon, Sparkles, Check, RefreshCw } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { scanHalKhataImageDirect, ExtractedOcrResult } from "../services/geminiDirect";

interface Props {
  onDataImported?: (data: ExtractedOcrResult) => void;
}

export default function OcrScannerScreen({ onDataImported }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ExtractedOcrResult | null>(null);

  const pickImage = async (useCamera: boolean) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      };

      const res = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedImage(res.assets[0].uri);
        setBase64Data(res.assets[0].base64 || null);
        setResult(null);
      }
    } catch (err: any) {
      Alert.alert("ক্যামেরা/ছবি ত্রুটি", err.message || "ছবি নির্বাচন করা সম্ভব হয়নি।");
    }
  };

  const handleScan = async () => {
    if (!base64Data) {
      Alert.alert("ছবি নির্বাচন করুন", "অনুগ্রহ করে হালখাতার একটি স্পষ্ট ছবি তুলুন বা গ্যালারি থেকে বাছুন।");
      return;
    }

    setScanning(true);
    try {
      const extracted = await scanHalKhataImageDirect(base64Data);
      setResult(extracted);
      Alert.alert("সফল!", "হালখাতা স্ক্যান সফল হয়েছে। ফলাফল নিচে পর্যালোচনা করুন।");
    } catch (err: any) {
      Alert.alert("স্ক্যানিং ব্যর্থ", err.message || "ছবি বিশ্লেষণ করতে সমস্যা হয়েছে।");
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.aiBadge}>
          <Sparkles size={16} color="#fbbf24" />
          <Text style={styles.aiBadgeText}>Google Gemini 2.5 Flash Vision AI</Text>
        </View>
        <Text style={styles.title}>হস্তলিখিত হালখাতা স্ক্যানার</Text>
        <Text style={styles.subtitle}>কাগজের হালখাতার ছবি তুলুন, এআই সরাসরি গুগল শিটে ডাটা এন্ট্রি করবে</Text>
      </View>

      {/* Camera & Gallery Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.captureBtn} onPress={() => pickImage(true)}>
          <Camera size={20} color="#ffffff" />
          <Text style={styles.btnText}>ছবি তুলুন (Camera)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
          <ImageIcon size={20} color="#cbd5e1" />
          <Text style={[styles.btnText, { color: "#cbd5e1" }]}>গ্যালারি (Gallery)</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.previewBox}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
          <TouchableOpacity
            style={styles.scanActionBtn}
            onPress={handleScan}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.scanActionText}>এআই বিশ্লেষণ করছে...</Text>
              </>
            ) : (
              <>
                <Sparkles size={18} color="#ffffff" />
                <Text style={styles.scanActionText}>স্ক্যান ও এক্সট্রাক্ট করুন</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Extracted Result Card */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeader}>পর্যালোচনা ও ফলাফল ({result.date})</Text>

          <View style={styles.resultBlock}>
            <Text style={styles.resultBlockTitle}>স্টক মজুদ (Stock)</Text>
            {result.stockEntries.map((st, i) => (
              <View key={i} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{st.eggType}:</Text>
                <Text style={styles.resultValue}>{st.currentStock} পিস @ ৳{st.purchaseRate}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultBlock}>
            <Text style={styles.resultBlockTitle}>আর্থিক হিসাব (Financials)</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>বাকি (Due):</Text>
              <Text style={styles.resultValue}>৳ {result.financialEntry?.totalDue?.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>নগদ ক্যাশ (Cash):</Text>
              <Text style={[styles.resultValue, { color: "#34d399" }]}>৳ {result.financialEntry?.totalCash?.toLocaleString()}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>সাবেক দেনা (Previous Balance):</Text>
              <Text style={styles.resultValue}>৳ {result.financialEntry?.prevDayBalance?.toLocaleString()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.importBtn}
            onPress={() => {
              if (onDataImported) onDataImported(result);
              Alert.alert("আমদানি সম্পন্ন", "হালখাতায় ডাটা যুক্ত করা হয়েছে!");
            }}
          >
            <Check size={18} color="#ffffff" />
            <Text style={styles.importBtnText}>হালখাতায় সংরক্ষণ করুন (Import)</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  aiBadgeText: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#f8fafc",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  captureBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d97706",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  galleryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  previewBox: {
    backgroundColor: "#131b2e",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  scanActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
    gap: 6,
  },
  scanActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  resultCard: {
    backgroundColor: "#131b2e",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 12,
  },
  resultBlock: {
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 10,
    borderRadius: 12,
  },
  resultBlockTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fbbf24",
    marginBottom: 6,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  resultLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
  resultValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f8fafc",
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  importBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});
