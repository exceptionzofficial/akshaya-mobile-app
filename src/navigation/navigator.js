import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// User Screens
import HomeScreen from '../screens/Home/HomeScreen';
import DailyMenuScreen from '../screens/Menu/DailyMenuScreen';
import MenuItemDetailScreen from '../screens/Menu/MenuItemDetailScreen';
import BookingScreen from '../screens/Booking/BookingScreen';
import BookingConfirmScreen from '../screens/Booking/BookingConfirmScreen';
import MyOrdersScreen from '../screens/Orders/MyOrdersScreen';
import OrderStatusScreen from '../screens/Orders/OrderStatusScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CartScreen from '../screens/Cart/CartScreen';

// Rider Screens
import RiderHomeScreen from '../screens/Rider/RiderHomeScreen';
import DeliveryScreen from '../screens/Rider/DeliveryScreen';

import { AuthContext } from '../context/AuthContext';
import { OrderContext } from '../context/OrderContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
    </Stack.Navigator>
  );
};

// Menu Stack
const MenuStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DailyMenu" component={DailyMenuScreen} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
    </Stack.Navigator>
  );
};

// Cart Stack
const CartStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
    </Stack.Navigator>
  );
};

// Orders Stack
const OrdersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
    </Stack.Navigator>
  );
};

// Custom Tab Bar Icon Component
const TabIcon = ({ name, focused, color }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        name={name}
        size={24}
        color={color}
        style={{ marginBottom: 2 }}
      />
    </View>
  );
};

// Cart Tab Icon with Badge
const CartTabIcon = ({ focused, color }) => {
  const { getCartItemCount } = useContext(OrderContext);
  const itemCount = getCartItemCount();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        name={focused ? 'cart' : 'cart-outline'}
        size={24}
        color={color}
        style={{ marginBottom: 2 }}
      />
      {itemCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -12,
          backgroundColor: '#E74C3C',
          borderRadius: 10,
          minWidth: 18,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '700',
          }}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// User Bottom Tabs - Green Theme
const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D7A4F',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8ECEF',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'restaurant' : 'restaurant-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ focused, color }) => (
            <CartTabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'receipt' : 'receipt-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Rider Bottom Tabs - Green Theme
const RiderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D7A4F',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8ECEF',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="RiderHome"
        component={RiderHomeScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'bicycle' : 'bicycle-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Delivery"
        component={DeliveryScreen}
        options={{
          tabBarLabel: 'Delivery',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'navigate' : 'navigate-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <AuthStack />;

  return user.role === 'rider' ? <RiderTabs /> : <UserTabs />;
};

export default AppNavigator;
