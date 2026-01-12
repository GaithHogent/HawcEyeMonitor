// src/components/room-screen/DeviceDetailsModal.tsx
import { View, Text, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";

type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

type Props = {
  styles: any;
  visible: boolean;
  deleting: boolean;
  selectedFs: FsDeviceInfo | null;

  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

const DeviceDetailsModal = ({ styles, visible, deleting, selectedFs, onClose, onEdit, onRemove }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Device details</Text>

            <Pressable style={styles.modalCloseBtn} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          <Text style={styles.modalRow}>Name: {selectedFs?.name ?? "-"}</Text>
          <Text style={styles.modalRow}>Type: {selectedFs?.typeRaw ?? "-"}</Text>
          <Text style={styles.modalRow}>Status: {selectedFs?.status ?? "-"}</Text>

          <View style={styles.modalActions}>
            <Button label="Edit" onPress={onEdit} variant="outline" disabled={deleting} />
            <Button label={deleting ? "Removing..." : "Remove form this room"} onPress={onRemove} disabled={deleting} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeviceDetailsModal;
