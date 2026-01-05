// src/navigation/AuthStack.tsx
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth-screens/LoginScreen';
import RegisterScreen from '../screens/auth-screens/RegisterScreen';
import type { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register'}}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;