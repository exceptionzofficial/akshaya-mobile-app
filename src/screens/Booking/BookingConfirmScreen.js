import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { OrderContext } from '../../context/OrderContext';

const BookingConfirmScreen = ({ route, navigation }) => {
  const { orderId, orderData } = route.params;
  const { clearCart } = useContext(OrderContext);
  const scaleAnim = new Animated.Value(0);

  // Detect if from cart
  const isFromCart = orderData?.fromCart === true;

  // Get display info based on source
  const getItemDisplay = () => {
    if (isFromCart && orderData.items) {
      const itemCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
      return `${itemCount} item${itemCount > 1 ? 's' : ''} from cart`;
    } else if (orderData?.item) {
      return `${orderData.item.name} x ${orderData.quantity || 1}`;
    }
    return 'Your meal';
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Clear cart if came from cart
    if (isFromCart) {
      clearCart();
    }
  }, []);

  const handleBackToHome = () => {
    // Reset navigation and go to Home tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  const handleTrackOrder = () => {
    // Navigate to Orders tab with OrderStatus screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Orders',
            state: {
              routes: [
                { name: 'MyOrders' },
                { name: 'OrderStatus', params: { orderId } }
              ],
              index: 1
            }
          }
        ],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.successRing}>
            <View style={styles.successCircle}>
              <Icon name="checkmark" size={60} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Text style={styles.title}>Order Placed Successfully! 🎉</Text>
        <Text style={styles.subtitle}>
          Your delicious meal is on its way
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>#{orderId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="fast-food-outline" size={20} color="#2D7A4F" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Item{isFromCart ? 's' : ''}</Text>
              <Text style={styles.detailValue}>{getItemDisplay()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="calendar-outline" size={20} color="#2D7A4F" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Delivery Date</Text>
              <Text style={styles.detailValue}>{orderData?.displayDate || orderData?.day || 'Today'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="time-outline" size={20} color="#2D7A4F" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Delivery Time</Text>
              <Text style={styles.detailValue}>{orderData?.displayTime || orderData?.selectedTime || 'ASAP'}</Text>
            </View>
          </View>

          {orderData?.deliveryAddress && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="location-outline" size={20} color="#2D7A4F" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Delivery Address</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {orderData.deliveryAddress}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount Paid</Text>
            <Text style={styles.amountValue}>₹{orderData?.totalAmount || 0}</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-circle" size={20} color="#2D7A4F" />
          <Text style={styles.infoText}>
            You'll receive a notification when your order is ready for delivery
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackOrder}
          >
            <Icon name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
          >
            <Icon name="home" size={20} color="#2D7A4F" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: 'rgba(45, 122, 79, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2D7A4F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D7A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  orderIdContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2D7A4F',
    marginLeft: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: '#2D7A4F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D7A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2D7A4F',
  },
  homeButtonText: {
    color: '#2D7A4F',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default BookingConfirmScreen;
