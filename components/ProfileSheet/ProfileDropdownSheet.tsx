import ProfileActions from "@/components/ProfileSheet/ProfileActions";
import ProfileHeader from "@/components/ProfileSheet/ProfileHeader";
import ProfileStatsGrid from "@/components/ProfileSheet/ProfileStatsGrid";
import { useAccountStore } from "@/stores/accountStore";
import { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSync: () => void;
  onSetting: () => void;
  onOpenProfile: () => void;
};

export default function ProfileSheet({
  visible,
  onClose,
  onSync,
  onSetting,
  onOpenProfile,
}: ProfileSheetProps) {
  const switchAccount = useAccountStore((s) => s.switchAccount);
  const profile = useAccountStore((s) => s.profile);
  const accounts = useAccountStore((s) => s.accounts);
  const loadAccounts = useAccountStore((s) => s.loadAccounts);

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (!visible) return;
    loadAccounts();
  }, [loadAccounts, visible]);

  async function handleAccountSwitch(tag: string) {
    if (tag === profile?.playerTag) return;

    onClose();
    await switchAccount(tag);
  }

  if (!profile) return null;

  const activeAccount = accounts.find((a) => a.tag === profile.playerTag);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet */}
        <View style={[styles.sheet, { maxHeight: screenHeight * 0.9 }]}>
          {/* Handle */}
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ProfileHeader profile={profile} />

            {accounts.length > 0 && (
              <View style={styles.accountsSection}>
                <Text style={styles.sectionTitle}>Accounts</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.avatarRow}
                >
                  {accounts
                    .filter((acc) => acc.tag !== profile?.playerTag)
                    .map((acc) => {
                      const initials = acc.name.slice(0, 2).toUpperCase();

                      return (
                        <Pressable
                          key={acc.tag}
                          style={styles.avatarItem}
                          onPress={() => handleAccountSwitch(acc.tag)}
                        >
                          <View
                            style={[
                              styles.avatarCircle,
                              { borderColor: acc.color },
                            ]}
                          >
                            <Text style={styles.avatarInitials}>
                              {initials}
                            </Text>
                          </View>
                          <Text style={styles.avatarLabel} numberOfLines={1}>
                            {acc.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                </ScrollView>

                {/* Active account chip */}
                {activeAccount && (
                  <View
                    style={[
                      styles.activeChip,
                      { borderColor: activeAccount.color + "40" },
                    ]}
                  >
                    <View
                      style={[
                        styles.activeChipDot,
                        { backgroundColor: activeAccount.color },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.accountName}>
                        {activeAccount.name}
                      </Text>
                      <Text style={styles.accountSub}>
                        TH{activeAccount.townhall} • {activeAccount.tag}
                      </Text>
                    </View>
                    <Text style={styles.activeLabel}>ACTIVE</Text>
                  </View>
                )}
              </View>
            )}
            {profile?.playerTag && (
              <ProfileStatsGrid
                profile={profile}
                builderCount={activeAccount?.builderCount ?? 1}
              />
            )}

            <ProfileActions
              onSync={onSync}
              onSetting={onSetting}
              onOpenProfile={onOpenProfile}
              onClose={onClose}
            />

            {/* Close Button */}
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handleWrapper: {
    alignSelf: "center",
    width: 48,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
  },

  accountsSection: {
    marginTop: 20,
    gap: 8,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  accountName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  accountSub: {
    fontSize: 12,
    color: "#94a3b8",
  },

  activeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fbbf24",
  },

  avatarRow: {
    gap: 10,
    paddingVertical: 4,
  },

  avatarItem: {
    alignItems: "center",
    gap: 6,
    width: 64,
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitials: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94a3b8",
  },

  activeDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#0f172a",
  },

  avatarLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    width: 64,
  },

  avatarLabelActive: {
    color: "#fbbf24",
    fontWeight: "600",
  },

  activeChip: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  activeChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  closeButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#475569",
    marginTop: 16,
  },

  closeButtonPressed: {
    opacity: 0.75,
  },

  closeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#cbd5e1",
  },
});
