// src/components/common/Header.tsx
import { View, Text } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: Props) => {
  return (
    <View className="mb-4">
      <Text className="text-[22px] font-extrabold text-[#0d7ff2] text-center">
        {title}
      </Text>

      {subtitle ? (
        <Text className="text-center text-gray-500 text-sm mt-[2px]">
          {subtitle}
        </Text>
      ) : null}

      <View className="self-center mt-2.5 h-1 w-[52px] bg-[#0d7ff2] rounded-full opacity-85" />
    </View>
  );
}
export default Header;