import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const OrderStatusScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [orderStatus, setOrderStatus] = useState('preparing');

  // Mock order data
  const orderData = {
    id: orderId,
    itemName: 'Organic Salad Bowl',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    quantity: 2,
    totalAmount: 340,
    deliveryDay: 'Today',
    deliveryTime: '12:00 PM',
    address: '123 Main Street, Apartment 4B, New Delhi - 110001',
    rider: {
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      vehicle: 'Honda Activa'
    }
  };

  const statusSteps = [
    { 
      key: 'confirmed', 
      label: 'Order Confirmed', 
      icon: 'checkmark-circle',
      description: 'Your order has been received',
      time: '10:30 AM'
    },
    { 
      key: 'preparing', 
      label: 'Preparing Food', 
      icon: 'restaurant',
      description: 'Our chef is preparing your meal',
      time: '10:45 AM'
    },
    { 
      key: 'ready', 
      label: 'Ready for Pickup', 
      icon: 'cube',
      description: 'Food is packed and ready',
      time: '11:15 AM'
    },
    { 
      key: 'picked_up', 
      label: 'Out for Delivery', 
      icon: 'bicycle',
      description: 'Rider is on the way',
      time: '11:30 AM'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: 'checkmark-done-circle',
      description: 'Enjoy your meal!',
      time: '12:00 PM'
    }
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === orderStatus);
  };

  const handleCallRider = () => {
    Linking.openURL(`tel:${orderData.rider.phone}`);
  };

  const handleTrackOnMap = () => {
    const address = encodeURIComponent(orderData.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
  };

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>#{orderId}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Card */}
        <View style={styles.itemCard}>
          <Image source={{ uri: orderData.image }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{orderData.itemName}</Text>
            <Text style={styles.itemQuantity}>Quantity: {orderData.quantity}</Text>
            <View style={styles.itemMeta}>
              <View style={styles.metaItem}>
                <Icon name="calendar-outline" size={14} color="#95A5A6" />
                <Text style={styles.metaText}>{orderData.deliveryDay}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={14} color="#95A5A6" />
                <Text style={styles.metaText}>{orderData.deliveryTime}</Text>
              </View>
            </View>
            <Text style={styles.itemAmount}>₹{orderData.totalAmount}</Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          
          {statusSteps.map((step, index) => {
            const currentIndex = getCurrentStepIndex();
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <View key={step.key} style={styles.stepContainer}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepIcon,
                    isActive && styles.stepIconActive,
                    isCurrent && styles.stepIconCurrent
                  ]}>
                    <Icon 
                      name={step.icon} 
                      size={20} 
                      color={isActive ? '#FFFFFF' : '#95A5A6'} 
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      isActive && styles.stepLineActive
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepRight}>
                  <View style={styles.stepHeader}>
                    <Text style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive
                    ]}>
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text style={styles.stepTime}>{step.time}</Text>
                    )}
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Rider Details */}
        {orderStatus === 'picked_up' && (
          <View style={styles.riderCard}>
            <View style={styles.riderHeader}>
              <View style={styles.riderAvatar}>
                <Icon name="person" size={32} color="#2D7A4F" />
              </View>
              <View style={styles.riderInfo}>
                <Text style={styles.riderLabel}>Your Delivery Partner</Text>
                <Text style={styles.riderName}>{orderData.rider.name}</Text>
                <Text style={styles.riderVehicle}>{orderData.rider.vehicle}</Text>
              </View>
            </View>

            <View style={styles.riderActions}>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={handleCallRider}
              >
                <Icon name="call" size={20} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.trackButton}
                onPress={handleTrackOnMap}
              >
                <Icon name="navigate" size={20} color="#2D7A4F" />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Icon name="location" size={24} color="#2D7A4F" />
            <Text style={styles.addressTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>{orderData.address}</Text>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={handleTrackOnMap}
          >
            <Icon name="map-outline" size={18} color="#2D7A4F" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Delivered State */}
        {orderStatus === 'delivered' && (
          <View style={styles.deliveredCard}>
            <Icon name="checkmark-done-circle" size={60} color="#4CAF50" />
            <Text style={styles.deliveredTitle}>Order Delivered!</Text>
            <Text style={styles.deliveredText}>
              Thank you for ordering with us. Enjoy your meal! 😊
            </Text>
            <TouchableOpacity style={styles.reorderButton}>
              <Icon name="repeat" size={20} color="#FFFFFF" />
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2D7A4F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E8ECEF',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8ECEF',
  },
  stepIconActive: {
    backgroundColor: '#2D7A4F',
    borderColor: '#2D7A4F',
  },
  stepIconCurrent: {
    shadowColor: '#2D7A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 4,
  },
  stepLineActive: {
    backgroundColor: '#2D7A4F',
  },
  stepRight: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#95A5A6',
  },
  stepLabelActive: {
    color: '#2C3E50',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 12,
    color: '#2D7A4F',
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 13,
    color: '#95A5A6',
    lineHeight: 18,
  },
  riderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  riderHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  riderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  riderLabel: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  riderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  riderVehicle: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2D7A4F',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  trackButtonText: {
    color: '#2D7A4F',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  mapButtonText: {
    color: '#2D7A4F',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deliveredCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deliveredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  deliveredText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  reorderButton: {
    flexDirection: 'row',
    backgroundColor: '#2D7A4F',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default OrderStatusScreen;
