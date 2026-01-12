// src/components/room-screen/DeviceDetailsModal.tsx
import { View, Text, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../Button";

type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

type Props = {
  visible: boolean;
  deleting: boolean;
  selectedFs: FsDeviceInfo | null;

  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onReportIssue: () => void;
};

const DeviceDetailsModal = ({ visible, deleting, selectedFs, onClose, onEdit, onRemove, onReportIssue }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-[rgba(0,0,0,0.35)] p-5 justify-center" onPress={onClose}>
        <Pressable className="bg-white rounded-[14px] p-4" onPress={() => {}}>
          <View className="flex-row items-center justify-between mb-[10px]">
            <Text className="text-[16px] font-bold text-gray-900 mb-[10px]">Device details</Text>

            <Pressable className="w-8 h-8 rounded-[10px] items-center justify-center bg-gray-100" onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color="#111827" />
            </Pressable>
          </View>

          <Text className="text-[14px] text-gray-700 mb-1.5">Name: {selectedFs?.name ?? "-"}</Text>
          <Text className="text-[14px] text-gray-700 mb-1.5">Type: {selectedFs?.typeRaw ?? "-"}</Text>
          <Text className="text-[14px] text-gray-700 mb-1.5">Status: {selectedFs?.status ?? "-"}</Text>

          <View className="flex-row gap-[10px] mt-3.5">
            <Button label="Edit" onPress={onEdit} variant="outline" disabled={deleting} />
            <Button label="Report issue" onPress={onReportIssue} variant="danger" disabled={deleting} />
            <Button label={deleting ? "Removing..." : "Remove form this room"} onPress={onRemove} disabled={deleting} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeviceDetailsModal;
