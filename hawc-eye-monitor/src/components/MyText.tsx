import { Text, TextProps } from 'react-native';

interface MyTextProps extends TextProps {
  className?: string;
}

export default function MyText({ className, children, ...rest }: MyTextProps) {
  return (
    <Text
      {...rest}
      className={`text-gray-900 ${className || ''}`}
    >
      {children}
    </Text>
  );
}
