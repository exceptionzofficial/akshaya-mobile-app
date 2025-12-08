import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';

const DeliveryScreen = ({ route }) => {
  const { orderId } = route.params;
  const [orderStatus, setOrderStatus] = useState('picked_up');

  const orderDetails = {
    id: orderId,
    customerName: 'John Doe',
    phone: '9876543210',
    address: '123 Main Street, Apartment 4B, New Delhi - 110001',
    items: 'Chicken Biryani x2, Raita x1',
    amount: 350,
    paymentMethod: 'Online Paid'
  };

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${orderDetails.phone}`);
  };

  const handleNavigate = () => {
    const address = encodeURIComponent(orderDetails.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  const handleMarkDelivered = () => {
    Alert.alert(
      'Confirm Delivery',
      'Have you delivered the order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Delivered', 
          onPress: async () => {
            try {
              // API call to mark order as delivered
              await fetch(`YOUR_API_URL/orders/${orderId}/delivered`, {
                method: 'PUT'
              });
              
              Alert.alert('Success', 'Order marked as delivered!');
              setOrderStatus('delivered');
              
              // Send notification to user
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Details</Text>

      <View style={styles.orderCard}>
        <Text style={styles.orderId}>Order #{orderDetails.id}</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Customer Name</Text>
          <Text style={styles.value}>{orderDetails.customerName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.value}>{orderDetails.phone}</Text>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleCallCustomer}
            >
              <Text style={styles.callButtonText}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Delivery Address</Text>
          <Text style={styles.value}>{orderDetails.address}</Text>
          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={handleNavigate}
          >
            <Text style={styles.navigateButtonText}>🗺️ Navigate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Order Items</Text>
          <Text style={styles.value}>{orderDetails.items}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{orderDetails.paymentMethod}</Text>
          <Text style={styles.amount}>₹{orderDetails.amount}</Text>
        </View>
      </View>

      {orderStatus !== 'delivered' ? (
        <TouchableOpacity 
          style={styles.deliveredButton}
          onPress={handleMarkDelivered}
        >
          <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.deliveredBadge}>
          <Text style={styles.deliveredText}>✓ Delivered Successfully</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  orderCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 8,
    marginBottom: 20
  },
  orderId: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#FF6347' },
  section: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#333' },
  phoneRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  callButton: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 20, 
    paddingVertical: 10,
    borderRadius: 6
  },
  callButtonText: { color: '#fff', fontWeight: 'bold' },
  navigateButton: { 
    backgroundColor: '#2196F3', 
    padding: 12, 
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center'
  },
  navigateButtonText: { color: '#fff', fontWeight: 'bold' },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#FF6347', marginTop: 4 },
  deliveredButton: { 
    backgroundColor: '#4CAF50', 
    padding: 18, 
    borderRadius: 8,
    alignItems: 'center'
  },
  deliveredButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  deliveredBadge: { 
    backgroundColor: '#E8F5E9', 
    padding: 18, 
    borderRadius: 8,
    alignItems: 'center'
  },
  deliveredText: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
});

export default DeliveryScreen;
