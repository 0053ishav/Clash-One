import ProfileActions from "@/components/ProfileSheet/ProfileActions";
import ProfileHeader from "@/components/ProfileSheet/ProfileHeader";
import ProfileStatsGrid from "@/components/ProfileSheet/ProfileStatsGrid";
import { PlayerProfile } from "@/types/player";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSync: () => void;
  onSetting: () => void;
  onOpenProfile: () => void;
};

export default function ProfileSheet({
  visible,
  onClose,
  profile,
  onSync,
  onSetting,
  onOpenProfile,
}: Props) {
  const screenHeight = Dimensions.get("window").height;

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

            {profile.playerTag && <ProfileStatsGrid profile={profile} />}

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
