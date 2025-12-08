import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';

const MenuItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);

  const handleAddToOrder = () => {
    navigation.navigate('Booking', { 
      item: { ...item, quantity },
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      mealType: 'lunch' // You can determine this based on time
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/400' }}
        style={styles.image}
      />
      
      <View style={styles.content}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {item.description || 'Delicious food item prepared with fresh ingredients. Perfect for your meal!'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Nutritional Info</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>Calories: {item.calories || '350'} kcal</Text>
            <Text style={styles.nutritionText}>Protein: {item.protein || '15'}g</Text>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>₹{item.price * quantity}</Text>
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={handleAddToOrder}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  itemName: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 24, color: '#FF6347', fontWeight: 'bold', marginTop: 8 },
  infoSection: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  description: { fontSize: 16, color: '#666', lineHeight: 24 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionText: { fontSize: 14, color: '#666' },
  quantitySection: { marginTop: 24 },
  quantityControls: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 8
  },
  qtyButton: { 
    backgroundColor: '#FF6347', 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  qtyButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  quantity: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 30 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  totalLabel: { fontSize: 14, color: '#666' },
  totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  orderButton: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 40, 
    paddingVertical: 16,
    borderRadius: 8
  },
  orderButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MenuItemDetailScreen;
