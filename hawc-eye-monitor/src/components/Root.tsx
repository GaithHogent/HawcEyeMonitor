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
import { ensureUserProfile, subscribeDevices, subscribeUserProfile } from "../services/devices.service";
import AccessPendingScreen from "../screens/auth-screens/AccessPendingScreen";
import AccessRejectedScreen from "../screens/auth-screens/AccessRejectedScreen";

import "../../global.css";

SplashScreen.preventAutoHideAsync();


const Root = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [profile, setProfile] = useState<{ role?: string; accessStatus?: string } | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const profileUnsubRef = useRef<null | (() => void)>(null);

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
    if (profileUnsubRef.current) {
      profileUnsubRef.current();
      profileUnsubRef.current = null;
    }

    if (!user) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);

    let active = true;

    (async () => {
      try {
        await ensureUserProfile(user.uid, user.email ?? "");

        if (!active) return;

        const unsub = subscribeUserProfile(user.uid, (p) => {
          setProfile(p);
          setIsProfileLoading(false);
        });

        profileUnsubRef.current = unsub;
      } catch {
        setProfile({ role: "staff", accessStatus: "pending" });
        setIsProfileLoading(false);
      }
    })();

    return () => {
      active = false;
      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (devicesUnsubRef.current) {
      devicesUnsubRef.current();
      devicesUnsubRef.current = null;
    }

    if (!user) {
      setIsDevicesLoading(false);
      return;
    }

    const access = String(profile?.accessStatus ?? "").toLowerCase().trim();
    if (access !== "approved") {
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
  }, [user, profile?.accessStatus]);

  useEffect(() => {
    if (!isAuthLoading && !isProfileLoading && !isDevicesLoading) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading, isProfileLoading, isDevicesLoading]);

  if (isAuthLoading || isProfileLoading || isDevicesLoading) {
    return null;
  }
  
  
  const access = String(profile?.accessStatus ?? "").toLowerCase().trim();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {user ? (
            access === "approved" ? (
              <RootNavigator />
            ) : access === "rejected" ? (
              <AccessRejectedScreen />
            ) : (
              <AccessPendingScreen />
            )
          ) : (
            <AuthStack />
          )}
         {/*<RootNavigator />*/}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default Root;
