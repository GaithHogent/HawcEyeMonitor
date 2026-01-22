// src/components/MyTextInput.tsx
import { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

const MyTextInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      className="w-full border border-gray-300 rounded-xl px-4 py-3"
      {...props}
    />
  );
});

export default MyTextInput;