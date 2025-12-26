import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { OrderContext } from '../../context/OrderContext';

const CartScreen = ({ navigation }) => {
    const {
        cart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getCartSubtotal,
        getDeliveryFee,
        getDiscount,
        getCartTotal
    } = useContext(OrderContext);

    const getItemImage = (item) => item.image || 'https://via.placeholder.com/100';
    const getItemName = (data) => typeof data === 'string' ? data : data?.name || 'Item';

    const handleRemoveItem = (item) => {
        Alert.alert(
            'Remove Item',
            `Remove ${item.name} from cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeFromCart(item.id, item.type)
                }
            ]
        );
    };

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Remove all items from cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => clearCart()
                }
            ]
        );
    };

    const handleProceedToCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart first');
            return;
        }

        const orderData = {
            items: cart,
            subtotal: getCartSubtotal(),
            deliveryFee: getDeliveryFee(),
            discount: getDiscount(),
            totalAmount: getCartTotal(),
            orderDate: new Date().toISOString(),
            fromCart: true
        };

        navigation.navigate('Payment', { orderData });
    };

    const subtotal = getCartSubtotal();
    const deliveryFee = getDeliveryFee();
    const discount = getDiscount();
    const total = getCartTotal();

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Cart</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Icon name="cart-outline" size={80} color="#CED4DA" />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptyText}>
                        Add some delicious meals to get started!
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('Menu')}
                    >
                        <Text style={styles.browseButtonText}>Browse Menu</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
                    <Icon name="trash-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                <View style={styles.itemsContainer}>
                    <Text style={styles.sectionTitle}>{cart.length} Items</Text>

                    {cart.map((item, index) => (
                        <View key={`${item.id}-${item.type}-${index}`} style={styles.cartItem}>
                            <Image
                                source={{ uri: getItemImage(item) }}
                                style={styles.itemImage}
                            />

                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {item.type === 'package' && item.day && (
                                    <Text style={styles.itemMeta}>
                                        {item.mealType} • {item.day}
                                    </Text>
                                )}
                                {item.type === 'single' && item.category && (
                                    <Text style={styles.itemMeta}>{item.category}</Text>
                                )}
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>

                            <View style={styles.itemActions}>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => decrementQuantity(item.id, item.type)}
                                    >
                                        <Icon name="remove" size={16} color="#2D7A4F" />
                                    </TouchableOpacity>

                                    <Text style={styles.qtyText}>{item.quantity}</Text>

                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => incrementQuantity(item.id, item.type)}
                                    >
                                        <Icon name="add" size={16} color="#2D7A4F" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveItem(item)}
                                >
                                    <Icon name="close-circle" size={22} color="#E74C3C" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Bill Summary */}
                <View style={styles.billCard}>
                    <Text style={styles.billTitle}>Bill Summary</Text>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
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
                                <Text style={[styles.billLabel, { color: '#4CAF50' }]}>
                                    Discount
                                </Text>
                            </View>
                            <Text style={[styles.billValue, { color: '#4CAF50' }]}>
                                -₹{discount}
                            </Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.billRow}>
                        <Text style={styles.billTotalLabel}>Total Amount</Text>
                        <Text style={styles.billTotalValue}>₹{total}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomBar}>
                <View style={styles.priceSection}>
                    <Text style={styles.bottomLabel}>Total</Text>
                    <Text style={styles.bottomPrice}>₹{total}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleProceedToCheckout}
                >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    <Icon name="arrow-forward" size={20} color="#FFFFFF" />
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
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C3E50',
        marginTop: 24,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
    },
    browseButton: {
        marginTop: 32,
        backgroundColor: '#2D7A4F',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    itemsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#E8ECEF',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 12,
        color: '#95A5A6',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D7A4F',
    },
    itemActions: {
        alignItems: 'flex-end',
        gap: 12,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        paddingHorizontal: 4,
    },
    qtyButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
        minWidth: 28,
        textAlign: 'center',
    },
    removeButton: {
        padding: 4,
    },
    billCard: {
        backgroundColor: '#FFFFFF',
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
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
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D7A4F',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default CartScreen;
