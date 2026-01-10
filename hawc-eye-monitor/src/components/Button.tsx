import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;   // ✅ إضافة
}

export default function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}   // ✅ منع الضغط
      disabled={disabled}
      className={`h-9 px-3.5 rounded-lg border items-center justify-center min-w-20 ${
        disabled
          ? 'bg-gray-300 border-gray-300'        // شكل معطّل
          : isPrimary
          ? 'bg-sky-500 border-sky-500'
          : 'bg-white border-gray-300'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-2xl ${
          disabled
            ? 'text-gray-500'
            : isPrimary
            ? 'text-white'
            : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
