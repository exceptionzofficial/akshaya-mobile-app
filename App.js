import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/navigator';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </OrderProvider>
    </AuthProvider>
  );
}
