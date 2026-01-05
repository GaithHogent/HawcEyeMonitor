import {Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const LoginScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-black">
      <Text className="text-white text-4xl font-bold">
        NativeWind Works ✅
      </Text>
    </SafeAreaView>
  )
}

export default LoginScreen