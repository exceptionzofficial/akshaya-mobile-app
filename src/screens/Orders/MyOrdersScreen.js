import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const MyOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ongoing');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    // Mock data
    const mockOrders = [
      {
        id: 'ORD001',
        itemName: 'Organic Salad Bowl',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        quantity: 2,
        deliveryDay: 'Today',
        deliveryTime: '12:00 PM',
        totalAmount: 340,
        status: 'preparing',
        orderDate: new Date().toISOString(),
      },
      {
        id: 'ORD002',
        itemName: 'Chicken Curry Rice',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        quantity: 1,
        deliveryDay: 'Tomorrow',
        deliveryTime: '2:00 PM',
        totalAmount: 170,
        status: 'confirmed',
        orderDate: new Date().toISOString(),
      },
      {
        id: 'ORD003',
        itemName: 'Veg Buddha Bowl',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        quantity: 1,
        deliveryDay: 'Yesterday',
        deliveryTime: '1:00 PM',
        totalAmount: 170,
        status: 'delivered',
        orderDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'ORD004',
        itemName: 'Dal Rice Combo',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        quantity: 3,
        deliveryDay: '2 days ago',
        deliveryTime: '7:00 PM',
        totalAmount: 260,
        status: 'delivered',
        orderDate: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    
    setOrders(mockOrders);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: '#2196F3', icon: 'checkmark-circle', label: 'Confirmed' };
      case 'preparing':
        return { color: '#FF9800', icon: 'restaurant', label: 'Preparing' };
      case 'out_for_delivery':
        return { color: '#9C27B0', icon: 'bicycle', label: 'Out for Delivery' };
      case 'delivered':
        return { color: '#4CAF50', icon: 'checkmark-done-circle', label: 'Delivered' };
      case 'cancelled':
        return { color: '#F44336', icon: 'close-circle', label: 'Cancelled' };
      default:
        return { color: '#95A5A6', icon: 'time', label: 'Pending' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ongoing') {
      return ['confirmed', 'preparing', 'out_for_delivery'].includes(order.status);
    } else {
      return ['delivered', 'cancelled'].includes(order.status);
    }
  });

  const renderOrderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderStatus', { orderId: item.id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.orderImage} />
        
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
              <Icon name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
          <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>

          <View style={styles.orderDetails}>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={14} color="#95A5A6" />
              <Text style={styles.detailText}>{item.deliveryDay}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={14} color="#95A5A6" />
              <Text style={styles.detailText}>{item.deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Icon name="chevron-forward" size={16} color="#2D7A4F" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>
            Ongoing
          </Text>
          {activeTab === 'ongoing' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
          {activeTab === 'history' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="receipt-outline" size={80} color="#E8ECEF" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'ongoing' 
              ? 'You don\'t have any ongoing orders'
              : 'Your order history is empty'
            }
          </Text>
          <TouchableOpacity 
            style={styles.orderNowButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="add" size={20} color="#FFFFFF" />
            <Text style={styles.orderNowText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D7A4F']} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  header: { 
    backgroundColor: '#2D7A4F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#95A5A6',
  },
  tabTextActive: {
    color: '#2D7A4F',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2D7A4F',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  listContent: { 
    padding: 20 
  },
  orderCard: { 
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  orderImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#E8ECEF',
  },
  orderInfo: {
    flex: 1,
    padding: 12,
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#2C3E50',
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '700',
    marginLeft: 4,
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
  orderDetails: { 
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: { 
    fontSize: 12, 
    color: '#7F8C8D',
    marginLeft: 4,
  },
  orderFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  totalAmount: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#2D7A4F' 
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: { 
    fontSize: 14, 
    color: '#2D7A4F', 
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyText: { 
    fontSize: 15, 
    color: '#95A5A6',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  orderNowButton: { 
    flexDirection: 'row',
    backgroundColor: '#2D7A4F', 
    paddingHorizontal: 32, 
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2D7A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  orderNowText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default MyOrdersScreen;
