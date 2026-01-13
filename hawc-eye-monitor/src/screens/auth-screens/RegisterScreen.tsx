// src/screens/auth-screens/RegisterScreen.tsx
import { useRef } from 'react';
import { View, TextInput, Pressable, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import MyText from '../../components/MyText';
import MyTextInput from '../../components/MyTextInput';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import type { AuthStackNavProps } from '../../navigators/types';
import { useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FirebaseError } from 'firebase/app';
import Button from '../../components/Button';
import { createUserProfile } from '../../services/devices.service';

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 chars').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
});

const RegisterScreen = () => {
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);


  const route = useRoute<AuthStackNavProps<'Register'>['route']>();

  const handleRegister = async (email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await createUserProfile(cred.user.uid, email);
    } catch (error) {
      if (error instanceof FirebaseError) {
        Alert.alert('Register Error', error.message);
      } else if (error instanceof Error) {
        Alert.alert('Register Error', error.message);
      } else {
        Alert.alert('Register Error', 'An unexpected error occurred.');
      }
    }
  };

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
  } = useFormik({
    initialValues: { email: route.params?.email ?? '', password: '', confirmPassword: '' },
    validationSchema: schema,
    onSubmit: values => handleRegister(values.email, values.password),
  });

  return (
    <View className="flex-1 bg-white" >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center"
        >
          <View className="items-center mb-8">
            <Image
              source={require('../../../assets/logos/blue.png')}
              className="w-[350px] h-[350px]"
              resizeMode="contain"
            />
            <MyText className="text-3xl font-bold mt-4">Create Account</MyText>
            <MyText className="text-gray-500">Sign up to get started</MyText>
          </View>

          <View className="gap-4">
            <MyTextInput
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              autoCapitalize="none"
              autoComplete='email'
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus();
              }}
            />

            {touched.email && errors.email ? (
              <MyText className="text-red-500 text-xs">{errors.email}</MyText>
            ) : null}

            <MyTextInput
              ref={passwordInputRef}
              placeholder="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              autoComplete='new-password'
              onBlur={handleBlur('password')}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordInputRef.current?.focus();
              }}
            />

            {touched.password && errors.password ? (
              <MyText className="text-red-500 text-xs">{errors.password}</MyText>
            ) : null}

            <MyTextInput
              ref={confirmPasswordInputRef}
              placeholder="Confirm password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
            />

            {touched.confirmPassword && errors.confirmPassword ? (
              <MyText className="text-red-500 text-xs">{errors.confirmPassword}</MyText>
            ) : null}

            <View className="mt-2">
              <Button
                label="Register"
                variant="primary"
                onPress={() => handleSubmit()}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
export default RegisterScreen;
