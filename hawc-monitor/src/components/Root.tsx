import "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import HawcTabNavigator from "../navigators/HawcTabNavigator";

const Root = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <HawcTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Root;

const styles = StyleSheet.create({});