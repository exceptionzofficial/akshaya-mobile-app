import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

const RiderHomeScreen = ({ navigation }) => {
  const [newOrders, setNewOrders] = useState([]);

  useEffect(() => {
    // Request notification permissions
    requestNotificationPermission();
    
    // Listen for foreground notifications
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === 1) { // Event type 1 is notification press
        handleNotificationPress(detail.notification);
      }
    });

    fetchNewOrders();
    return () => unsubscribe();
  }, []);

  const requestNotificationPermission = async () => {
    await notifee.requestPermission();
  };

  const displayNotification = async (orderData) => {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'orders',
      name: 'Order Notifications',
      importance: AndroidImportance.HIGH,
    });

    // Display notification
    await notifee.displayNotification({
      title: '🔔 New Order!',
      body: `Order #${orderData.orderId} is ready for pickup`,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      data: {
        orderId: orderData.orderId,
      },
    });
  };

  const handleNotificationPress = (notification) => {
    const orderId = notification.data?.orderId;
    if (orderId) {
      Alert.alert(
        'New Order!',
        `Order #${orderId} is ready for pickup`,
        [
          { text: 'Ignore', style: 'cancel' },
          { 
            text: 'Accept', 
            onPress: () => acceptOrder(orderId)
          }
        ]
      );
    }
  };

  const fetchNewOrders = () => {
    setNewOrders([
      { 
        id: '001', 
        customerName: 'John Doe', 
        address: '123 Main St',
        items: 'Chicken Biryani x2',
        amount: 300
      }
    ]);
  };

  const acceptOrder = (orderId) => {
    navigation.navigate('Delivery', { orderId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Orders</Text>
      
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => displayNotification({ orderId: '123' })}
      >
        <Text style={styles.testButtonText}>Test Notification</Text>
      </TouchableOpacity>
      
      <FlatList
        data={newOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderText}>Order #{item.id}</Text>
            <Text style={styles.customerText}>{item.customerName}</Text>
            <Text style={styles.addressText}>{item.address}</Text>
            <Text style={styles.itemsText}>{item.items}</Text>
            <Text style={styles.amountText}>₹{item.amount}</Text>
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => acceptOrder(item.id)}
            >
              <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  testButton: { 
    backgroundColor: '#2196F3', 
    padding: 12, 
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  testButtonText: { color: '#fff', fontWeight: 'bold' },
  orderCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  orderText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  customerText: { fontSize: 16, marginBottom: 4 },
  addressText: { fontSize: 14, color: '#666', marginBottom: 4 },
  itemsText: { fontSize: 14, marginBottom: 4 },
  amountText: { fontSize: 18, fontWeight: 'bold', color: '#FF6347', marginBottom: 12 },
  acceptButton: { 
    backgroundColor: '#4CAF50', 
    padding: 12, 
    borderRadius: 6,
    alignItems: 'center'
  },
  acceptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default RiderHomeScreen;
