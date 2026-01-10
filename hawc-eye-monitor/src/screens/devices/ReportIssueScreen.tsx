// src/screens/devices/ReportIssueScreen.tsx
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { DevicesStackNavProps, DevicesStackParamsList } from "../../navigators/types";
import type { RouteProp } from "@react-navigation/native";
import { reportDeviceIssue } from "../../services/devices.service";

type R = RouteProp<DevicesStackParamsList, "ReportIssue">;

const ReportIssueScreen = () => {
  const navigation = useNavigation<DevicesStackNavProps<"ReportIssue">["navigation"]>();
  const route = useRoute<R>();
  const { deviceId } = route.params;

  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!issueType.trim()) return;

    try {
      setSaving(true);
      await reportDeviceIssue(deviceId, issueType.trim(), issueDescription.trim());
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (navigation.getParent()?.canGoBack()) {
        navigation.getParent()?.goBack();
      } else {
        navigation.navigate("DevicesList");
      }
    } catch (e) {
      Alert.alert("Failed", "Could not submit the issue. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="rounded-2xl border border-gray-200 p-4">
        <Text className="text-xl font-bold text-gray-900">Report Issue</Text>

        <View className="mt-4">
          <Text className="text-xs text-gray-500">Issue Type</Text>
          <TextInput
            value={issueType}
            onChangeText={setIssueType}
            placeholder="e.g. Sensor malfunction"
            className="mt-1 h-12 rounded-xl border border-gray-300 px-3 text-sm text-gray-900"
          />
        </View>

        <View className="mt-4">
          <Text className="text-xs text-gray-500">Issue Description</Text>
          <TextInput
            value={issueDescription}
            onChangeText={setIssueDescription}
            placeholder="Describe the problem..."
            multiline
            className="mt-1 min-h-[80px] rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
        </View>
      </View>

      <View className="mt-4">
        <Pressable
          onPress={onSubmit}
          disabled={saving}
          className="h-12 rounded-xl items-center justify-center bg-red-600"
        >
          {saving ? <ActivityIndicator /> : <Text className="text-white font-semibold">Submit Issue</Text>}
        </Pressable>
      </View>
    </View>
  );
};

export default ReportIssueScreen;
