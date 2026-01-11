// src/components/Button.tsx
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const Button = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  className = '',
  textClassName = '',
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`h-12 px-3.5 rounded-xl border items-center justify-center min-w-20 ${
        disabled
          ? 'bg-gray-300 border-gray-300'
          : isPrimary
          ? 'bg-blue-600 border-blue-600'
          : variant === 'danger'
          ? 'bg-red-600 border-red-600'
          : variant === 'success'
          ? 'bg-green-600 border-green-600'
          : 'bg-white border-gray-300'
      } ${className}`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-base font-semibold ${
          disabled
            ? 'text-gray-500'
            : isPrimary
            ? 'text-white'
            : variant === 'danger'
            ? 'text-white'
            : variant === 'success'
            ? 'text-white'
            : 'text-gray-700'
        } ${textClassName}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
export default Button;
