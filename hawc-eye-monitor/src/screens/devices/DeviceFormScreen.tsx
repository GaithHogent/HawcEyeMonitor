import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { DevicesStackNavProps, DevicesStackParamsList } from "../../navigators/types";
import type { RouteProp } from "@react-navigation/native";
import type { DeviceDoc, DeviceItem } from "../../types/device";
import { createDevice, updateDevice } from "../../services/devices.service";
import { Formik } from "formik";
import * as Yup from "yup";
import DeviceTypeSelect from "../../components/devices/DeviceTypeSelect";
import { DEVICE_STATUSES } from "../../types/deviceStatuses";

type R = RouteProp<DevicesStackParamsList, "DeviceForm">;

const Schema = Yup.object().shape({
  description: Yup.string().trim().min(3, "Description is too short").required("Description is required"),
  type: Yup.string().required("Device type is required"),
});

const DeviceFormScreen = () => {
  const navigation = useNavigation<DevicesStackNavProps<"DeviceForm">["navigation"]>();
  const rootNavigation = useNavigation<any>();
  const route = useRoute<R>();

  const editDevice = (route.params?.device as DeviceItem | undefined) ?? undefined;
  const isEdit = !!editDevice;

  const returnTo = (route.params as any)?.returnTo as
    | { tab: string; screen?: string; params?: any }
    | undefined;

  const finish = () => {
    // close form (modal/back)
    navigation.goBack();

    // ✅ لازم تروح لـ Tabs أولاً، بعدها تختار التاب وتدخل للسكرين
    if (returnTo?.tab) {
      rootNavigation.navigate("Tabs", {
        screen: returnTo.tab,
        params: returnTo.screen
          ? { screen: returnTo.screen, params: returnTo.params }
          : returnTo.params,
      });
    }
  };

  const initialValues = {
    description: editDevice?.name ?? "", // name is used as description
    type: editDevice?.type ?? "",
  };

  const onSubmit = async (values: typeof initialValues) => {
    const payload: DeviceDoc = {
      name: values.description.trim(), // store description in name
      type: values.type,
      status: isEdit ? editDevice!.status : DEVICE_STATUSES.find((s) => s.key === "inactive")!.key, // default from source
    };

    if (isEdit && editDevice) {
      await updateDevice(editDevice.id, payload);
      finish();
      return;
    }

    await createDevice(payload);
    finish();
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="rounded-2xl border border-gray-200 p-4">
        <Formik initialValues={initialValues} validationSchema={Schema} onSubmit={onSubmit}>
          {({ handleChange, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
            <>
              <Text className="text-sm text-gray-600">Description</Text>
              <TextInput
                value={values.description}
                onChangeText={handleChange("description")}
                placeholder="e.g. Camera at main entrance"
                className="mt-2 h-11 rounded-xl border border-gray-200 px-3 text-gray-900"
              />
              {touched.description && errors.description ? (
                <Text className="mt-1 text-sm text-red-600">{errors.description}</Text>
              ) : null}

              <Text className="mt-4 text-sm text-gray-600">Device Type</Text>
              <DeviceTypeSelect
                value={values.type}
                onChange={(v) => setFieldValue("type", v)}
                error={errors.type}
                touched={touched.type}
              />

              <View className="mt-6">
                <Pressable
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  className={[
                    "h-12 rounded-xl items-center justify-center",
                    isSubmitting ? "bg-gray-300" : "bg-blue-600",
                  ].join(" ")}
                >
                  {isSubmitting ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-white font-semibold">{isEdit ? "Save Changes" : "Create Device"}</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
}
export default DeviceFormScreen;
