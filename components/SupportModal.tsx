import { track } from "@/utils/analytics/analytics";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { ConfirmModal } from "./ConfirmModal";

type Props = {
  visible: boolean;
  onClose: () => void;
  debugInfo: string;
};

const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "Widget Issue",
  "Notification Issue",
  "Account Import",
  "General Feedback",
];

export function SupportModal({ visible, onClose, debugInfo }: Props) {
  const [category, setCategory] = useState("Bug Report");

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);

  const sendEmail = async () => {
    try {
      setSending(true);

      const supportId = Crypto.randomUUID();

      track("support_submitted", {
        support_id: supportId,
        category,
        app_version: Application.nativeApplicationVersion,
      });

      const response = await fetch("https://support.clashwidget.online", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supportId,
          category,
          message,
          debugInfo,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed");
      }

      setMessage("");

      setShowSuccessModal(true);
    } catch (error) {
      console.log(error);

      setShowErrorModal(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.container}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              nestedScrollEnabled
              contentContainerStyle={{
                paddingBottom: 40,
              }}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Support & Feedback</Text>

                <Pressable onPress={onClose} hitSlop={12}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </Pressable>
              </View>

              <Text style={styles.label}>Category</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategory(item);
                    }}
                    style={[
                      styles.chip,
                      category === item && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === item && styles.chipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* <Text style={styles.label}>Subject</Text> */}

              {/* <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Short summary"
              placeholderTextColor="#64748b"
              style={styles.input}
            /> */}

              <Text style={styles.label}>Message</Text>

              <TextInput
                multiline
                value={message}
                onChangeText={setMessage}
                placeholder="Describe the issue or feedback..."
                placeholderTextColor="#64748b"
                style={styles.messageInput}
              />
              <Text
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  marginTop: 6,
                  textAlign: "right",
                }}
              >
                {message.length}/1000
              </Text>

              {message.trim().length > 0 && (
                <Text
                  style={{
                    color: message.trim().length < 10 ? "#f59e0b" : "#22c55e",
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {message.trim().length < 10
                    ? `${10 - message.trim().length} more characters required`
                    : "Ready to send"}
                </Text>
              )}
              <View style={styles.guidelines}>
                <Text style={styles.guidelineTitle}>Helpful Information</Text>

                <Text style={styles.guidelineText}>• What happened?</Text>

                <Text style={styles.guidelineText}>• What did you expect?</Text>

                <Text style={styles.guidelineText}>• Steps to reproduce</Text>

                <Text style={styles.guidelineText}>
                  • Screenshots help a lot.
                </Text>

                <Text style={styles.guidelineText}>
                  We automatically include app and device information to help
                  diagnose issues. No personal information is shared.
                </Text>
              </View>

              <Pressable
                style={styles.debugButton}
                onPress={() => Clipboard.setStringAsync(debugInfo)}
              >
                <Ionicons name="copy-outline" size={18} color="#fbbf24" />

                <Text style={styles.debugText}>Copy Debug Info</Text>
              </Pressable>

              <View
                style={{
                  alignItems: "center",
                  marginTop: 24,
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: "#1e293b",
                }}
              >
                <Text style={styles.aboutTitle}>Clash Widget</Text>

                <Text style={styles.aboutVersion}>
                  v{Application.nativeApplicationVersion}
                </Text>

                <Text
                  style={{
                    color: "#64748b",
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  support@clashwidget.online
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontSize: 10,
                    marginTop: 4,
                  }}
                >
                  We typically respond within 48 hours.
                </Text>
              </View>

              <Pressable
                style={[
                  styles.sendButton,
                  (message.trim().length < 10 || sending) && {
                    opacity: 0.5,
                  },
                ]}
                disabled={message.trim().length < 10 || sending}
                onPress={sendEmail}
              >
                <Text style={styles.sendText}>
                  {sending ? "Sending Feedback..." : "Send Feedback"}
                </Text>
              </Pressable>

              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <ConfirmModal
        visible={showSuccessModal}
        title="Feedback Sent"
        message="Thanks for helping improve Clash Widget. Your feedback has been sent successfully."
        confirmText="Done"
        cancelText=""
        onConfirm={() => {
          setShowSuccessModal(false);

          setMessage("");

          setCategory("Bug Report");
          onClose();
        }}
        onCancel={() => {}}
      />
      <ConfirmModal
        visible={showErrorModal}
        title="Failed to Send"
        message="We couldn't send your feedback right now. Please try again in a moment."
        confirmText="OK"
        cancelText=""
        onConfirm={() => {
          setShowErrorModal(false);
        }}
        onCancel={() => {}}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: 8,
    marginTop: 16,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },

  chipActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },

  chipText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },

  messageInput: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingTop: 14,
    minHeight: 140,
    textAlignVertical: "top",
    fontSize: 14,
  },

  guidelines: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(251,191,36,0.08)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.15)",
  },

  guidelineTitle: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 8,
  },

  guidelineText: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },

  debugButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
  },

  debugText: {
    color: "#fbbf24",
    fontSize: 13,
    fontWeight: "600",
  },

  sendButton: {
    marginTop: 20,
    backgroundColor: "#fbbf24",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  sendText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },

  cancelButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },

  aboutTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fbbf24",
  },

  aboutVersion: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
});
