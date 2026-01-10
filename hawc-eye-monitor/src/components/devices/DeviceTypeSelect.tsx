// src/components/devices/DeviceTypeSelect.tsx
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DEVICE_TYPES, DeviceTypeDef } from "../../types/deviceTypes";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  error?: string;
  touched?: boolean;
};

export default function DeviceTypeSelect({ value, onChange, error, touched }: Props) {
  const [open, setOpen] = useState(false);
  const selected = DEVICE_TYPES.find((t) => t.label === value);

  const renderItem = ({ item }: { item: DeviceTypeDef }) => (
    <Pressable
      onPress={() => {
        onChange(item.label);
        setOpen(false);
      }}
      className="flex-row items-center px-4 py-3"
    >
      <MaterialCommunityIcons name={item.icon} size={22} color="#0d7ff2" />
      <Text className="ml-3 text-gray-900">{item.label}</Text>
    </Pressable>
  );

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="mt-2 h-11 rounded-xl border border-gray-200 px-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          {selected ? (
            <>
              <MaterialCommunityIcons name={selected.icon} size={20} color="#0d7ff2" />
              <Text className="ml-2 text-gray-900">{selected.label}</Text>
            </>
          ) : (
            <Text className="text-gray-400">Select device type</Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
      </Pressable>

      {touched && error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade">
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)}>
          <View className="mt-auto bg-white rounded-t-2xl">
            <FlatList
              data={DEVICE_TYPES}
              keyExtractor={(i) => i.label}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
