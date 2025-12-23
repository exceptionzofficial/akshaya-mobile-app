import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const { orderData } = route.params;
  const { user } = useContext(AuthContext);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: 'wallet-outline',
      iconColor: '#2D7A4F',
      description: 'Google Pay, PhonePe, Paytm'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card-outline',
      iconColor: '#FF6347',
      description: 'Visa, Mastercard, Rupay'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: 'business-outline',
      iconColor: '#2196F3',
      description: 'All major banks'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: 'cash-outline',
      iconColor: '#FFB800',
      description: 'Pay when you receive'
    },
  ];

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to place an order');
      return;
    }

    setLoading(true);

    try {
      // 1. Construct payload fitting backend schema
      // Backend expects: items (array), customer (obj), totalAmount, paymentMethod, etc.
      const payload = {
        items: [
          {
            id: orderData.item.id,
            name: orderData.item.name,
            quantity: orderData.quantity,
            price: orderData.item.price,
            image: orderData.item.image,
            // Include package items shorthand if it's a package
            packageItems: orderData.item.items || [],
            day: orderData.day,
            mealType: orderData.item.mealType
          }
        ],
        customer: {
          name: user.name,
          phone: user.phone,
          email: user.email || '',
          address: orderData.deliveryAddress
        },
        totalAmount: orderData.totalAmount,
        paymentMethod: paymentMethods.find(m => m.id === selectedMethod)?.name || 'Cash',
        notes: orderData.specialInstructions || '',
        deliveryInfo: {
          date: orderData.displayDate,
          time: orderData.displayTime,
          isToday: orderData.isToday
        }
      };

      // 2. Call Create Order API
      console.log('📦 Creating Order:', JSON.stringify(payload, null, 2));
      const response = await ordersAPI.create(payload);

      if (response.success) {
        // 3. Success -> Navigate to Confirmation
        navigation.replace('BookingConfirm', {
          orderId: response.data.id,
          orderData: { ...orderData, orderId: response.data.id, totalAmount: payload.totalAmount }
        });
      } else {
        throw new Error(response.message || 'Failed to place order');
      }

    } catch (error) {
      console.error('Order creation error:', error);
      Alert.alert('Order Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Green Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Icon name="fast-food-outline" size={20} color="#2D7A4F" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Item</Text>
              <Text style={styles.summaryValue}>{orderData.item.name} x {orderData.quantity}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Icon name="calendar-outline" size={20} color="#2D7A4F" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {orderData.displayDate} {orderData.isToday ? `• ${orderData.displayTime}` : `(${orderData.day})`}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Icon name="location-outline" size={20} color="#2D7A4F" />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Address</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>{orderData.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{orderData.totalAmount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.methodIcon,
                { backgroundColor: `${method.iconColor}15` }
              ]}>
                <Icon name={method.icon} size={28} color={method.iconColor} />
              </View>

              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDesc}>{method.description}</Text>
              </View>

              <View style={[
                styles.radio,
                selectedMethod === method.id && styles.radioActive
              ]}>
                {selectedMethod === method.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers & Coupons */}
        <TouchableOpacity style={styles.couponCard}>
          <View style={styles.couponLeft}>
            <Icon name="pricetag" size={24} color="#2D7A4F" />
            <View style={styles.couponInfo}>
              <Text style={styles.couponTitle}>Apply Coupon</Text>
              <Text style={styles.couponDesc}>Get instant discounts</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#2D7A4F" />
        </TouchableOpacity>

        {/* Secure Payment Banner */}
        <View style={styles.secureBanner}>
          <Icon name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.secureInfo}>
            <Text style={styles.secureTitle}>100% Secure Payment</Text>
            <Text style={styles.secureDesc}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{orderData.totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, loading && { opacity: 0.7 }]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="lock-closed" size={20} color="#FFFFFF" />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: '#2D7A4F',
    backgroundColor: '#E8F5E9',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#95A5A6',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#2D7A4F',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D7A4F',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderStyle: 'dashed',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  couponInfo: {
    marginLeft: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  couponDesc: {
    fontSize: 13,
    color: '#95A5A6',
  },
  secureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  secureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  secureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D7A4F',
    marginBottom: 4,
  },
  secureDesc: {
    fontSize: 13,
    color: '#52A373',
    lineHeight: 18,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  payButton: {
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
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default PaymentScreen;
