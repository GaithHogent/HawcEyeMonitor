// src/components/Root.tsx
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import AuthStack from "../navigators/AuthStack";
import RootNavigator from "../navigators/RootNavigator";
import * as SplashScreen from "expo-splash-screen";
import { subscribeDevices } from "../services/devices.service";

import "../../global.css";

SplashScreen.preventAutoHideAsync();


const Root = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isDevicesLoading, setIsDevicesLoading] = useState(true);
  const devicesUnsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (devicesUnsubRef.current) {
      devicesUnsubRef.current();
      devicesUnsubRef.current = null;
    }

    if (!user) {
      setIsDevicesLoading(false);
      return;
    }

    setIsDevicesLoading(true);

    let first = true;
    const unsub = subscribeDevices((_items) => {
      if (first) {
        first = false;
        setIsDevicesLoading(false);
      }
    });

    devicesUnsubRef.current = unsub;

    return () => {
      if (devicesUnsubRef.current) {
        devicesUnsubRef.current();
        devicesUnsubRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading && !isDevicesLoading) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading, isDevicesLoading]);

  if (isAuthLoading || isDevicesLoading) {
    return null;
  }
  
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {user ? <RootNavigator /> : <AuthStack />}
         {/*<RootNavigator />*/}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default Root;
