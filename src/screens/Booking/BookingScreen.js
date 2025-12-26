import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Modal,
  ToastAndroid,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { OrderContext } from '../../context/OrderContext';

const BookingScreen = ({ route, navigation }) => {
  const { addToCart } = useContext(OrderContext);
  const { item, day, type = 'package' } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);

  // Show toast message
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  // Helper functions for item data
  const getItemName = (itemData) =>
    typeof itemData === 'string' ? itemData : itemData?.name || 'Item';

  const getItemImage = (itemData) =>
    typeof itemData === 'string'
      ? 'https://via.placeholder.com/150'
      : (itemData?.image || 'https://via.placeholder.com/150');

  const itemPrice = item.price || 0;
  const subtotal = itemPrice * quantity;
  const deliveryFee = 20;
  const discount = subtotal > 200 ? 30 : 0;
  const totalAmount = subtotal + deliveryFee - discount;

  const getMealTypeInfo = (mealType) => {
    const types = {
      breakfast: { icon: 'sunny-outline', color: '#FFB800', label: 'Breakfast' },
      lunch: { icon: 'restaurant-outline', color: '#FF6347', label: 'Lunch' },
      dinner: { icon: 'moon-outline', color: '#9B59B6', label: 'Dinner' }
    };
    return types[mealType] || types.lunch;
  };

  const calculateOrderDetails = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDayName = days[today.getDay()];

    let displayDate = '';
    let displayTime = '';
    let isToday = false;

    if (day === currentDayName) {
      isToday = true;
      displayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      displayTime = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      isToday = false;
      const targetDayIndex = days.indexOf(day);
      const currentDayIndex = today.getDay();
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) daysToAdd += 7;

      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysToAdd);
      displayDate = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      displayTime = 'Scheduled';
    }

    return { displayDate, displayTime, isToday };
  };

  const handleFetchLocation = () => {
    setIsFetchingLocation(true);
    if (global.navigator && global.navigator.geolocation) {
      global.navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryAddress(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)} (Please add details)`);
          setIsFetchingLocation(false);
        },
        (error) => {
          console.log(error);
          setDeliveryAddress('Current Location (Please edit to add details)');
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setTimeout(() => {
        setDeliveryAddress('Current Location (Please edit to add details)');
        setIsFetchingLocation(false);
      }, 1000);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      type,
      day: day || null,
      quantity,
    };

    addToCart(cartItem);
    showToast(`${item.name} (x${quantity}) added to cart!`);
    navigation.goBack();
  };

  const handleProceedToPayment = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }

    const { displayDate, displayTime, isToday } = calculateOrderDetails();

    const orderData = {
      item: { ...item, quantity },
      day,
      quantity,
      deliveryAddress,
      displayDate,
      displayTime,
      isToday,
      specialInstructions,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      orderDate: new Date().toISOString()
    };

    navigation.navigate('Payment', { orderData });
  };

  const mealInfo = getMealTypeInfo(item.mealType);

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
        <Text style={styles.headerTitle}>
          {type === 'package' ? 'Package Details' : 'Item Details'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image & Info */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadges}>
              {item.mealType && (
                <View style={[styles.mealBadge, { backgroundColor: mealInfo.color }]}>
                  <Icon name={mealInfo.icon} size={14} color="#FFFFFF" />
                  <Text style={styles.mealBadgeText}>{mealInfo.label}</Text>
                </View>
              )}
              {item.day && (
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{item.day}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Item Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoTitleSection}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            {item.description && (
              <Text style={styles.itemDesc}>{item.description}</Text>
            )}
          </View>

          {/* Package Items Preview */}
          {type === 'package' && item.items && item.items.length > 0 && (
            <View style={styles.packageItemsSection}>
              <View style={styles.packageItemsHeader}>
                <Text style={styles.packageItemsTitle}>
                  Package includes {item.items.length} items
                </Text>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setShowItemsModal(true)}
                >
                  <Text style={styles.viewAllBtnText}>View All</Text>
                  <Icon name="chevron-forward" size={16} color="#2D7A4F" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.packageItemsScroll}
              >
                {item.items.map((packageItem, idx) => (
                  <View key={idx} style={styles.packageItemCard}>
                    <Image
                      source={{ uri: getItemImage(packageItem) }}
                      style={styles.packageItemImage}
                    />
                    <Text style={styles.packageItemName} numberOfLines={2}>
                      {getItemName(packageItem)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Icon name="remove" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleFetchLocation}
              disabled={isFetchingLocation}
            >
              <Icon name="locate" size={16} color="#2D7A4F" />
              <Text style={styles.locationButtonText}>
                {isFetchingLocation ? 'Fetching...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Icon name="location-outline" size={20} color="#2D7A4F" />
            <TextInput
              style={styles.input}
              placeholder="Enter your delivery address"
              placeholderTextColor="#95A5A6"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <View style={styles.inputContainer}>
            <Icon name="create-outline" size={20} color="#2D7A4F" />
            <TextInput
              style={styles.input}
              placeholder="Any special requests?"
              placeholderTextColor="#95A5A6"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
            />
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total ({quantity} items)</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={styles.billLabelContainer}>
              <Icon name="bicycle-outline" size={16} color="#2D7A4F" />
              <Text style={styles.billLabel}>Delivery Fee</Text>
            </View>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.billRow}>
              <View style={styles.billLabelContainer}>
                <Icon name="pricetag-outline" size={16} color="#4CAF50" />
                <Text style={[styles.billLabel, { color: '#4CAF50' }]}>Discount</Text>
              </View>
              <Text style={[styles.billValue, { color: '#4CAF50' }]}>-₹{discount}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomPrice}>₹{totalAmount}</Text>
        </View>
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Icon name="cart-outline" size={18} color="#2D7A4F" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToPayment}
          >
            <Text style={styles.proceedButtonText}>Pay Now</Text>
            <Icon name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Package Items Modal */}
      <Modal
        visible={showItemsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowItemsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Package Items ({item.items?.length || 0})
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowItemsModal(false)}
              >
                <Icon name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.itemsGrid}>
                {(item.items || []).map((packageItem, idx) => (
                  <View key={idx} style={styles.modalItemCard}>
                    <Image
                      source={{ uri: getItemImage(packageItem) }}
                      style={styles.modalItemImage}
                    />
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemName}>
                        {getItemName(packageItem)}
                      </Text>
                      <Text style={styles.modalItemIndex}>
                        Item {idx + 1} of {item.items.length}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowItemsModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E8ECEF',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  mealBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dayBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    marginBottom: 16,
  },
  infoTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  itemDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  packageItemsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 16,
  },
  packageItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageItemsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D7A4F',
  },
  packageItemsScroll: {
    paddingRight: 16,
  },
  packageItemCard: {
    width: 90,
    marginRight: 12,
    alignItems: 'center',
  },
  packageItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E8ECEF',
    marginBottom: 8,
  },
  packageItemName: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D7A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    minWidth: 40,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  locationButtonText: {
    fontSize: 13,
    color: '#2D7A4F',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    minHeight: 40,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECEF',
    marginVertical: 12,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  billTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  priceSection: {},
  bottomLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D7A4F',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2D7A4F',
    gap: 6,
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalItemCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalItemImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8ECEF',
  },
  modalItemInfo: {
    padding: 12,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  modalItemIndex: {
    fontSize: 12,
    color: '#95A5A6',
  },
  modalDoneBtn: {
    margin: 20,
    backgroundColor: '#2D7A4F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BookingScreen;
