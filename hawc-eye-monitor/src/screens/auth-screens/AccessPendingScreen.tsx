// src/screens/auth-screens/AccessPendingScreen.tsx
import { View } from "react-native";
import MyText from "../../components/MyText";
import Button from "../../components/Button";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AccessPendingScreen = () => {
  const { top } = useSafeAreaInsets();
  const containerStyle = { paddingTop: top };

  return (
    <View className="flex-1 bg-white px-6 justify-center" style={containerStyle}>
      <MyText className="text-2xl font-extrabold text-gray-900 text-center">Pending approval</MyText>
      <MyText className="text-gray-500 text-center mt-2">
        Your account is waiting for admin approval. You will be able to access the app once approved.
      </MyText>

      <View className="mt-6">
        <Button label="Logout" variant="outline" onPress={() => signOut(auth)} />
      </View>
    </View>
  );
};

export default AccessPendingScreen;
