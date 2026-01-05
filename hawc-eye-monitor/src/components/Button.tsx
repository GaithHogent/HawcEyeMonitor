import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export default function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`h-9 px-3.5 rounded-lg border items-center justify-center min-w-20 ${
        isPrimary ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-2xl ${
          isPrimary ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
