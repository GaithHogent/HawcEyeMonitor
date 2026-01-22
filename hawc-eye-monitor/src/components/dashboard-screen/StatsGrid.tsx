// src/components/dashboard-screen/StatsGrid.tsx
import { View, Text } from "react-native";

type StatItem = {
  label: string;
  value: string | number;
  color?: string;
};

type Props = {
  stats: StatItem[];
};

const StatsGrid = ({ stats }: Props) => {
  return (
    <View className="flex-row flex-wrap justify-between gap-3">
      {stats.map((item, i) => (
        <View
          key={i}
          className="w-[48%] bg-white rounded-2xl p-3"
          style={{ elevation: 1 }}
        >
          <Text className="text-gray-500 text-xs">{item.label}</Text>
          <Text
            className="mt-1.5 text-[26px] font-extrabold"
            style={{ color: item.color || "#111" }}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
export default StatsGrid;