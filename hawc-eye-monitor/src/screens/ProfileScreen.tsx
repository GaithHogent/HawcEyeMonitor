// src/screens/ProfileScreen.tsx
import { View } from "react-native";
import Header from "../components/Header";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import Button from "../components/Button";
import ProfileCard from "../components/ProfileCard";

const ProfileScreen = () => {

const onLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const email = auth.currentUser?.email ?? "";
  const uid = auth.currentUser?.uid ?? "";

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Header title="Profile" />

      <View className="flex-1 items-center justify-start mt-12">
        <ProfileCard name={email} email={email} uid={uid} />

        <View className="w-4/5 max-w-[340px] mt-6">
          <Button
            label="Log out"
            variant="primary"
            onPress={onLogout}
          />
        </View>
      </View>
    </View>
  );
}

export default ProfileScreen;
