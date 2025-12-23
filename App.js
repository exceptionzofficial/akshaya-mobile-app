import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/navigator';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OrderProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </OrderProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
