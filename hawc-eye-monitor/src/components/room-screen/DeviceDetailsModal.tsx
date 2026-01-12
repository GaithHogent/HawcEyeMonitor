// src/components/room-screen/DeviceDetailsModal.tsx
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";

type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

type Props = {
  styles?: any;
  visible: boolean;
  deleting: boolean;
  resolving: boolean;
  selectedFs: FsDeviceInfo | null;

  onClose: () => void;
  onEdit: () => void;
  onReportIssue: () => void;
  onResolveIssue: () => void;
  onRemove: () => void;
};

const fallbackStyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  modalRow: { fontSize: 13, color: "#111827", marginTop: 6 },
  modalActions: { marginTop: 14, gap: 10 },
});

const DeviceDetailsModal = ({
  styles,
  visible,
  deleting,
  resolving,
  selectedFs,
  onClose,
  onEdit,
  onReportIssue,
  onResolveIssue,
  onRemove,
}: Props) => {
  const s = styles ?? fallbackStyles;
  const isIssue = String(selectedFs?.status ?? "").toLowerCase().trim() === "issue";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.modalCard} onPress={() => {}}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Device details</Text>

            <Pressable style={s.modalCloseBtn} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          <Text style={s.modalRow}>Name: {selectedFs?.name ?? "-"}</Text>
          <Text style={s.modalRow}>Type: {selectedFs?.typeRaw ?? "-"}</Text>
          <Text style={s.modalRow}>Status: {selectedFs?.status ?? "-"}</Text>

          <View style={s.modalActions}>
            <Button label="Edit" onPress={onEdit} variant="outline" disabled={deleting || resolving} />

            {isIssue ? (
              <Button
                label={resolving ? "Resolving..." : "Resolved"}
                onPress={onResolveIssue}
                variant="success"
                disabled={deleting || resolving}
              />
            ) : (
              <Button
                label="Report Issue"
                onPress={onReportIssue}
                variant="danger"
                disabled={deleting || resolving}
              />
            )}

            <Button label={deleting ? "Removing..." : "Remove form this room"} onPress={onRemove} disabled={deleting || resolving} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeviceDetailsModal;
