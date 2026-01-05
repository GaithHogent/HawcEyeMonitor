// src/screens/LoginScreen.tsx 
import { useRef } from 'react';
import { View, TextInput, Pressable, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import MyText from '../../components/MyText';
import MyTextInput from '../../components/MyTextInput';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import type { AuthStackNavProps } from '../../navigators/types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseError } from 'firebase/app';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 chars').required('Required'),
});

export default function LoginScreen() {
  const passwordInputRef = useRef<TextInput | null>(null);
  const { top } = useSafeAreaInsets();
  const containerStyle = { paddingTop: top };
  const navigation = useNavigation<AuthStackNavProps<'Login'>['navigation']>();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          Alert.alert('Login Error', error.message, [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Register', { email }),
            },
          ]);
        } else {
          Alert.alert('Login Error', error.message);
        }
      } else if (error instanceof Error) {
        Alert.alert('Login Error', error.message);
      } else {
        Alert.alert('Login Error', 'An unexpected error occurred.');
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
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: values => handleLogin(values.email, values.password),
  });

  return (
    <View className="flex-1 bg-white" style={containerStyle}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1 bg-white px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="justify-center"
        >
          <View className="flex-1">
            <View className="items-center mb-8">
              <Image
                source={require('../../../assets/logos/blue.png')}
                className="w-[350px] h-[350px]"
                resizeMode="contain"
              />
              <MyText className="text-3xl font-bold mt-4">Welcome Back</MyText>
              <MyText className="text-gray-500">Login to continue</MyText>
            </View>

            <View className="gap-4">
              <MyTextInput
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete='email'
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
                onBlur={handleBlur('password')}
                autoComplete='password'
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit()}
              />

              {touched.password && errors.password ? (
                <MyText className="text-red-500 text-xs">{errors.password}</MyText>
              ) : null}

              <View className="mt-2">
                <Button
                  label="Login"
                  variant="primary"
                  onPress={() => handleSubmit()}
                />
              </View>
            </View>

            <View className="items-center mt-6">
              <MyText className="text-gray-600">Don't have an account?</MyText>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <MyText className="text-sky-500 font-medium mt-1">Create one</MyText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
