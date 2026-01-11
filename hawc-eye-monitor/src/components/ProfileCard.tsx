import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MyText from '../components/MyText';

interface Props {
  name: string;
  email: string;
  uid: string;
}

const ProfileCard = ({ name, email, uid }: Props) => {
  const displayName = email.split('@')[0];

  return (
    <View className="w-4/5 max-w-[340px] aspect-square items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 shadow-md android:elevation-3 p-5">
      <View className="mb-2.5">
        <MaterialCommunityIcons name="account-circle" size={64} color="#6b7280" />
      </View>
      <View className="w-full">
        <View className="mb-3">
          <MyText className="text-[12px] text-gray-500 mb-1">Username</MyText>
          <MyText className="text-[16px] text-gray-900">{displayName}</MyText>
        </View>

        <View className="mb-3">
          <MyText className="text-[12px] text-gray-500 mb-1">Email</MyText>
          <MyText className="text-[16px] text-gray-900">{email}</MyText>
        </View>

        <View>
          <MyText className="text-[12px] text-gray-500 mb-1">User ID</MyText>
          <MyText className="text-[12px] text-gray-700">{uid}</MyText>
        </View>
      </View>
    </View>
  );
}
export default ProfileCard;
