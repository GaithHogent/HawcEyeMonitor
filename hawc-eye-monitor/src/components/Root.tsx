// src/components/Root.tsx
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import AuthStack from "../navigators/AuthStack";
import RootNavigator from "../navigators/RootNavigator";
import * as SplashScreen from "expo-splash-screen";

import "../../global.css";

SplashScreen.preventAutoHideAsync();


const Root = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading]);

  if (isAuthLoading) {
    return null;
  }
  
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/*user ? <RootNavigator /> : <AuthStack />*/}
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default Root;
