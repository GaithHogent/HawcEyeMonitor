// src/screens/devices/DeviceFormScreen.tsx
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { DevicesStackNavProps, DevicesStackParamsList } from "../../navigators/types";
import type { RouteProp } from "@react-navigation/native";
import type { DeviceDoc, DeviceItem } from "../../types/device";
import { createDevice, updateDevice } from "../../services/devices.service";
import { Formik } from "formik";
import * as Yup from "yup";
import DeviceTypeSelect from "../../components/devices/DeviceTypeSelect";
import { DEVICE_STATUSES } from "../../types/deviceStatuses";
import Button from "../../components/Button";

type R = RouteProp<DevicesStackParamsList, "DeviceForm">;

const Schema = Yup.object().shape({
  description: Yup.string().trim().min(3, "Description is too short").required("Description is required"),
  type: Yup.string().required("Device type is required"),
});

const DeviceFormScreen = () => {
  const navigation = useNavigation<DevicesStackNavProps<"DeviceForm">["navigation"]>();
  const route = useRoute<R>();

  const editDevice = (route.params?.device as DeviceItem | undefined) ?? undefined;
  const isEdit = !!editDevice;

  const finish = () => {
    navigation.goBack();
  };

  const initialValues = {
    description: editDevice?.name ?? "",
    type: editDevice?.type ?? "",
  };

  const onSubmit = async (values: typeof initialValues) => {
    const payload: DeviceDoc = {
      name: values.description.trim(),
      type: values.type,
      status: isEdit ? editDevice!.status : DEVICE_STATUSES.find((s) => s.key === "inactive")!.key,
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
                <Button
                  label={isEdit ? "Save Changes" : "Create Device"}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="w-full"
                />
                {isSubmitting ? (
                  <View className="absolute inset-0 items-center justify-center">
                    <ActivityIndicator />
                  </View>
                ) : null}
              </View>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
}
export default DeviceFormScreen;
