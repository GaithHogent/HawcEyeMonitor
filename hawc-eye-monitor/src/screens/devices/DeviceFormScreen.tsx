// src/screens/devices/DeviceFormScreen.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { DevicesStackNavProps, DevicesStackParamsList } from "../../navigators/types";
import type { RouteProp } from "@react-navigation/native";
import type { DeviceDoc, DeviceItem, DeviceStatus } from "../../types/device";
import { createDevice, updateDevice } from "../../services/devices.service";

type R = RouteProp<DevicesStackParamsList, "DeviceForm">;

export default function DeviceFormScreen() {
  const navigation = useNavigation<DevicesStackNavProps<"DeviceForm">["navigation"]>();
  const route = useRoute<R>();

  const editDevice = (route.params?.device as DeviceItem | undefined) ?? undefined;
  const isEdit = !!editDevice;

  const [name, setName] = useState(editDevice?.name ?? "");
  const [type, setType] = useState(editDevice?.type ?? "");
  const [description, setDescription] = useState(editDevice?.description ?? "");
  const [status, setStatus] = useState<DeviceStatus>(editDevice?.status ?? "active");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setName(editDevice?.name ?? "");
    setType(editDevice?.type ?? "");
    setDescription(editDevice?.description ?? "");
    setStatus(editDevice?.status ?? "active");
  }, [isEdit, editDevice]);

  const canSave = useMemo(() => {
    return name.trim().length > 0 && type.trim().length > 0;
  }, [name, type]);

  const onSave = async () => {
    if (!canSave) return;

    const payload: DeviceDoc = {
      name: name.trim(),
      type: type.trim(),
      status,
      description: description.trim().length ? description.trim() : undefined,
    };

    try {
      setSaving(true);

      if (isEdit && editDevice) {
        await updateDevice(editDevice.id, payload);
        navigation.goBack();
        return;
      }

      await createDevice(payload);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="rounded-2xl border border-gray-200 p-4">
        <Text className="text-sm text-gray-600">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Camera 1"
          className="mt-2 h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
        />

        <Text className="mt-4 text-sm text-gray-600">Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="e.g. camera"
          className="mt-2 h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
        />

        <Text className="mt-4 text-sm text-gray-600">Description (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description..."
          className="mt-2 h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
        />

        <Text className="mt-4 text-sm text-gray-600">Status</Text>
        <View className="mt-2 flex-row gap-2">
          {(["active", "inactive", "issue"] as const).map((s) => {
            const selected = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                className={[
                  "flex-1 h-11 rounded-xl items-center justify-center border",
                  selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200",
                ].join(" ")}
              >
                <Text className={selected ? "text-white font-semibold" : "text-gray-800 font-semibold"}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-4">
        <Pressable
          onPress={onSave}
          disabled={!canSave || saving}
          className={[
            "h-12 rounded-xl items-center justify-center",
            !canSave || saving ? "bg-gray-300" : "bg-blue-600",
          ].join(" ")}
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-white font-semibold">{isEdit ? "Save Changes" : "Create Device"}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
