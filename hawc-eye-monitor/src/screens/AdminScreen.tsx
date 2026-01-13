// src/screens/admin/AdminScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { setUserAccessStatus, subscribeUsersByAccessStatus } from "../services/devices.service";
import { auth } from "../config/firebase";

type UserRow = {
  id: string;
  email?: string;
  role?: string;
  accessStatus?: "pending" | "approved" | "rejected" | string;
};

const AdminScreen = () => {
  const [pending, setPending] = useState<UserRow[]>([]);
  const [approved, setApproved] = useState<UserRow[]>([]);
  const [rejected, setRejected] = useState<UserRow[]>([]);

  useEffect(() => {
    const unsubPending = subscribeUsersByAccessStatus("pending", (rows) => setPending(rows));
    const unsubApproved = subscribeUsersByAccessStatus("approved", (rows) => setApproved(rows));
    const unsubRejected = subscribeUsersByAccessStatus("rejected", (rows) => setRejected(rows));

    return () => {
      unsubPending();
      unsubApproved();
      unsubRejected();
    };
  }, []);

  const setStatus = async (uid: string, nextStatus: "approved" | "rejected" | "pending") => {
    try {
      await setUserAccessStatus(uid, nextStatus);
    } catch (e: any) {
      Alert.alert("Error", e?.message ? String(e.message) : "Failed to update user.");
    }
  };

  const confirmSetStatus = (item: UserRow, nextStatus: "approved" | "rejected" | "pending") => {
    const email = item.email ?? "this user";
    const action =
      nextStatus === "approved" ? "approve" : nextStatus === "rejected" ? "reject" : "set to pending";

    Alert.alert(
      "Confirm",
      `Are you sure you want to ${action} ${email}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "default", onPress: () => setStatus(item.id, nextStatus) },
      ]
    );
  };

  const renderRow = (item: UserRow, mode: "pending" | "approved" | "rejected") => {
    return (
      <View className="bg-white border border-gray-200 rounded-xl px-3 py-3 mb-2">
        <Text className="text-[14px] font-extrabold text-gray-900">{item.email ?? "-"}</Text>
        <Text className="text-[12px] text-gray-600 mt-0.5">UID: {item.id}</Text>
        <Text className="text-[12px] text-gray-600 mt-0.5">Role: {item.role ?? "-"}</Text>

        <View className="flex-row items-center gap-2 mt-3">
          {mode === "pending" && (
            <>
              <Pressable
                onPress={() => confirmSetStatus(item, "approved")}
                className="px-3 py-2 rounded-lg bg-green-600"
              >
                <Text className="text-white font-bold">Approve</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmSetStatus(item, "rejected")}
                className="px-3 py-2 rounded-lg bg-red-600"
              >
                <Text className="text-white font-bold">Reject</Text>
              </Pressable>
            </>
          )}

          {mode === "approved" && (
            <Pressable
              onPress={() => confirmSetStatus(item, "rejected")}
              className="px-3 py-2 rounded-lg bg-red-600"
            >
              <Text className="text-white font-bold">Reject</Text>
            </Pressable>
          )}

          {mode === "rejected" && (
            <Pressable
              onPress={() => confirmSetStatus(item, "approved")}
              className="px-3 py-2 rounded-lg bg-green-600"
            >
              <Text className="text-white font-bold">Approve</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const Section = ({ title, data, mode }: { title: string; data: UserRow[]; mode: "pending" | "approved" | "rejected" }) => {
    return (
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[16px] font-extrabold text-gray-900">{title}</Text>
          <View className="px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
            <Text className="text-[12px] font-bold text-gray-800">{data.length}</Text>
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={(x) => x.id}
          renderItem={({ item }) => renderRow(item, mode)}
          ListEmptyComponent={<Text className="text-[12px] text-gray-500">No items.</Text>}
        />
      </View>
    );
  };

  const selfUid = auth.currentUser?.uid ?? "";

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="mb-4">
        <Text className="text-[18px] font-extrabold text-gray-900">Admin</Text>
        <Text className="text-[12px] text-gray-600 mt-0.5">Manage access requests</Text>
      </View>

      <Section title="New requests" data={pending.filter((u) => u.id !== selfUid)} mode="pending" />
      <Section title="Approved users" data={approved.filter((u) => u.id !== selfUid)} mode="approved" />
      <Section title="Rejected users" data={rejected.filter((u) => u.id !== selfUid)} mode="rejected" />
    </View>
  );
};

export default AdminScreen;
