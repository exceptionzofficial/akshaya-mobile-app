import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { OrderContext } from '../../context/OrderContext';
import { packagesAPI, singlesAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(OrderContext);
  const [packageMeals, setPackageMeals] = useState([]);
  const [singleMeals, setSingleMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const currentHour = new Date().getHours();

  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const filterOptions = [
    // Meal Types
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: '#FFB800', type: 'meal' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline', color: '#FF6347', type: 'meal' },
    { id: 'dinner', label: 'Dinner', icon: 'moon-outline', color: '#9B59B6', type: 'meal' },
    // All Categories from Admin Panel
    { id: 'Soups', label: 'Soups', icon: 'water-outline', color: '#3498DB', type: 'category' },
    { id: 'Classic Soups', label: 'Classic Soups', icon: 'water-outline', color: '#5DADE2', type: 'category' },
    { id: 'Traditional & Healthy Soups', label: 'Traditional Soups', icon: 'leaf-outline', color: '#48C9B0', type: 'category' },
    { id: 'Salads', label: 'Salads', icon: 'leaf-outline', color: '#27AE60', type: 'category' },
    { id: 'International Salads', label: 'Intl Salads', icon: 'globe-outline', color: '#2ECC71', type: 'category' },
    { id: 'Shutters Veg', label: 'Shutters Veg', icon: 'nutrition-outline', color: '#58D68D', type: 'category' },
    { id: 'Starters & Snacks', label: 'Starters', icon: 'fast-food-outline', color: '#E67E22', type: 'category' },
    { id: 'Chaat', label: 'Chaat', icon: 'pizza-outline', color: '#F39C12', type: 'category' },
    { id: 'Sandwich', label: 'Sandwich', icon: 'layers-outline', color: '#D35400', type: 'category' },
    { id: 'Mojito', label: 'Mojito', icon: 'wine-outline', color: '#1ABC9C', type: 'category' },
    { id: 'Milk Shake', label: 'Milk Shake', icon: 'cafe-outline', color: '#9B59B6', type: 'category' },
    { id: 'Fresh Juices', label: 'Fresh Juices', icon: 'beer-outline', color: '#E74C3C', type: 'category' },
    { id: 'Falooda & Desserts', label: 'Desserts', icon: 'ice-cream-outline', color: '#C0392B', type: 'category' },
  ];

  // Show toast message
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch packages for today
      const packagesRes = await packagesAPI.getByDay(today);
      if (packagesRes.success) {
        setPackageMeals(packagesRes.data.packages || []);
      }

      // Fetch single meals (includeHidden=true to show out-of-stock items)
      const singlesRes = await singlesAPI.getAll(true);
      if (singlesRes.success) {
        setSingleMeals(singlesRes.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenuData();
    setRefreshing(false);
  };

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const getFilteredPackages = () => {
    let items = packageMeals;

    if (selectedFilters.length > 0) {
      items = items.filter(item => {
        if (selectedFilters.includes(item.mealType)) return true;
        const itemNames = (item.items || []).map(i =>
          (typeof i === 'string' ? i : i?.name || '').toLowerCase()
        );
        return selectedFilters.some(filter =>
          itemNames.some(name => name.includes(filter))
        );
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (item.items || []).some(subItem => {
          const name = typeof subItem === 'string' ? subItem : subItem?.name || '';
          return name.toLowerCase().includes(query);
        })
      );
    }

    return items;
  };

  const getFilteredSingles = () => {
    let items = singleMeals;

    if (selectedFilters.length > 0) {
      // Get category filters (not meal type filters)
      const categoryFilters = selectedFilters.filter(f => {
        const opt = filterOptions.find(o => o.id === f);
        return opt && opt.type === 'category';
      });

      if (categoryFilters.length > 0) {
        items = items.filter(item => {
          const category = item.category || '';
          // Exact category match
          return categoryFilters.includes(category);
        });
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    return items;
  };

  const getMealTypeInfo = (mealType) => {
    const types = {
      breakfast: { icon: 'sunny-outline', color: '#FFB800', label: 'Breakfast', order: 1 },
      lunch: { icon: 'restaurant-outline', color: '#FF6347', label: 'Lunch', order: 2 },
      dinner: { icon: 'moon-outline', color: '#9B59B6', label: 'Dinner', order: 3 }
    };
    return types[mealType] || types.lunch;
  };

  const getItemName = (item) => typeof item === 'string' ? item : item?.name || 'Item';
  const getItemImage = (item) => typeof item === 'string' ? 'https://via.placeholder.com/150' : (item?.image || 'https://via.placeholder.com/150');

  // Group packages by meal type in correct order
  const getGroupedPackages = () => {
    const filtered = getFilteredPackages();
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: []
    };

    filtered.forEach(pkg => {
      if (groups[pkg.mealType]) {
        groups[pkg.mealType].push(pkg);
      }
    });

    return groups;
  };

  const renderPackageCard = (item) => {
    const mealInfo = getMealTypeInfo(item.mealType);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.packageCard}
        onPress={() => navigation.navigate('Booking', { item, day: today, type: 'package' })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/400' }}
          style={styles.packageImage}
        />

        <View style={[styles.mealBadge, { backgroundColor: mealInfo.color }]}>
          <Icon name={mealInfo.icon} size={12} color="#FFFFFF" />
          <Text style={styles.mealBadgeText}>{mealInfo.label}</Text>
        </View>

        <View style={styles.packageContent}>
          <View style={styles.packageHeader}>
            <View style={styles.packageTitleSection}>
              <Text style={styles.packageName} numberOfLines={1}>{item.name}</Text>
              {item.description && (
                <Text style={styles.packageDesc} numberOfLines={1}>{item.description}</Text>
              )}
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>₹{item.price}</Text>
            </View>
          </View>

          {item.items && item.items.length > 0 && (
            <View style={styles.itemsSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsScroll}
              >
                {item.items.slice(0, 4).map((subItem, idx) => (
                  <View key={idx} style={styles.itemChip}>
                    <Image
                      source={{ uri: getItemImage(subItem) }}
                      style={styles.itemChipImage}
                    />
                    <Text style={styles.itemChipText} numberOfLines={1}>
                      {getItemName(subItem)}
                    </Text>
                  </View>
                ))}
                {item.items.length > 4 && (
                  <View style={styles.moreChip}>
                    <Text style={styles.moreChipText}>+{item.items.length - 4}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.itemCountBadge}>
              <Icon name="layers-outline" size={14} color="#2D7A4F" />
              <Text style={styles.itemCountText}>{item.items?.length || 0} items</Text>
            </View>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => navigation.navigate('Booking', { item, day: today, type: 'package' })}
            >
              <Text style={styles.orderButtonText}>Order</Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSingleCard = (item) => {
    // Check if item is out of stock (hidden in admin)
    const isOutOfStock = item.isVisible === false;

    const handleAddToCart = () => {
      if (isOutOfStock) return;
      addToCart({
        ...item,
        type: 'single',
        quantity: 1
      });
      showToast(`${item.name} added to cart!`);
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.singleCard, isOutOfStock && styles.singleCardDisabled]}
        onPress={() => !isOutOfStock && navigation.navigate('Booking', { item, type: 'single' })}
        activeOpacity={isOutOfStock ? 1 : 0.7}
        disabled={isOutOfStock}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/200' }}
          style={[styles.singleImage, isOutOfStock && { opacity: 0.5 }]}
        />
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        <View style={styles.singleContent}>
          {item.category && (
            <View style={[styles.categoryBadge, isOutOfStock && { opacity: 0.5 }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={[styles.singleName, isOutOfStock && { color: '#95A5A6' }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.singleDesc, isOutOfStock && { color: '#BDC3C7' }]} numberOfLines={2}>{item.description}</Text>
          <View style={styles.singleFooter}>
            <Text style={[styles.singlePrice, isOutOfStock && styles.singlePriceDisabled]}>₹{item.price}</Text>
            <TouchableOpacity
              style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
              onPress={handleAddToCart}
              disabled={isOutOfStock}
            >
              <Icon name={isOutOfStock ? "close" : "cart"} size={16} color={isOutOfStock ? "#95A5A6" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7A4F" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  const groupedPackages = getGroupedPackages();
  const filteredSingles = getFilteredSingles();
  const totalPackages = Object.values(groupedPackages).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
          >
            <Icon name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBar}>
            <Icon name="search-outline" size={20} color="#95A5A6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search packages..."
              placeholderTextColor="#95A5A6"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={18} color="#95A5A6" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilters.length > 0 && styles.filterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon
              name="options-outline"
              size={22}
              color={selectedFilters.length > 0 ? '#FFFFFF' : '#2D7A4F'}
            />
            {selectedFilters.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedFilters.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <View style={styles.activeFiltersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScroll}
          >
            {selectedFilters.map(filterId => {
              const filter = filterOptions.find(f => f.id === filterId);
              if (!filter) return null;
              return (
                <TouchableOpacity
                  key={filterId}
                  style={[styles.activeFilterChip, { backgroundColor: filter.color }]}
                  onPress={() => toggleFilter(filterId)}
                >
                  <Icon name={filter.icon} size={14} color="#FFFFFF" />
                  <Text style={styles.activeFilterText}>{filter.label}</Text>
                  <Icon name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.clearFiltersBtn}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2D7A4F']}
            tintColor="#2D7A4F"
          />
        }
      >
        {/* Today Info Bar */}
        <View style={styles.todayBar}>
          <View style={styles.todayLeft}>
            <Icon name="calendar-outline" size={18} color="#2D7A4F" />
            <Text style={styles.todayText}>{today}'s Menu</Text>
          </View>
          <Text style={styles.packageCountText}>
            {totalPackages + filteredSingles.length} items
          </Text>
        </View>

        {/* Package Sections in Order */}
        <View style={styles.packagesList}>
          {/* Breakfast Section */}
          {groupedPackages.breakfast.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <View style={[styles.mealIconContainer, { backgroundColor: '#FFF8E1' }]}>
                  <Icon name="sunny-outline" size={22} color="#FFB800" />
                </View>
                <Text style={styles.mealSectionTitle}>Breakfast</Text>
                <Text style={styles.mealCount}>{groupedPackages.breakfast.length}</Text>
              </View>
              {groupedPackages.breakfast.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Lunch Section */}
          {groupedPackages.lunch.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <View style={[styles.mealIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Icon name="restaurant-outline" size={22} color="#FF6347" />
                </View>
                <Text style={styles.mealSectionTitle}>Lunch</Text>
                <Text style={styles.mealCount}>{groupedPackages.lunch.length}</Text>
              </View>
              {groupedPackages.lunch.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Dinner Section */}
          {groupedPackages.dinner.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <View style={[styles.mealIconContainer, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="moon-outline" size={22} color="#9B59B6" />
                </View>
                <Text style={styles.mealSectionTitle}>Dinner</Text>
                <Text style={styles.mealCount}>{groupedPackages.dinner.length}</Text>
              </View>
              {groupedPackages.dinner.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Single Meals Section */}
          {filteredSingles.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <View style={[styles.mealIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="fast-food-outline" size={22} color="#2D7A4F" />
                </View>
                <Text style={styles.mealSectionTitle}>Single Meals</Text>
                <Text style={styles.mealCount}>{filteredSingles.length}</Text>
              </View>
              <View style={styles.singlesGrid}>
                {filteredSingles.map(item => renderSingleCard(item))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {totalPackages === 0 && filteredSingles.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="fast-food-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedFilters.length > 0
                  ? 'No matching items'
                  : 'No menu available'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Check the Menu tab for other days'}
              </Text>
              {(searchQuery || selectedFilters.length > 0) && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery('');
                    clearFilters();
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Menu</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Icon name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.filterSectionTitle}>Meal Type</Text>
              <View style={styles.filterGrid}>
                {filterOptions.slice(0, 3).map(option => {
                  const isSelected = selectedFilters.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.filterOption,
                        isSelected && { backgroundColor: option.color, borderColor: option.color }
                      ]}
                      onPress={() => toggleFilter(option.id)}
                    >
                      <Icon
                        name={option.icon}
                        size={24}
                        color={isSelected ? '#FFFFFF' : option.color}
                      />
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && { color: '#FFFFFF' }
                      ]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Icon name="checkmark-circle" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterGrid}>
                {filterOptions.slice(3).map(option => {
                  const isSelected = selectedFilters.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.filterOption,
                        isSelected && { backgroundColor: option.color, borderColor: option.color }
                      ]}
                      onPress={() => toggleFilter(option.id)}
                    >
                      <Icon
                        name={option.icon}
                        size={24}
                        color={isSelected ? '#FFFFFF' : option.color}
                      />
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && { color: '#FFFFFF' }
                      ]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Icon name="checkmark-circle" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={clearFilters}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyBtnText}>
                  Apply {selectedFilters.length > 0 ? `(${selectedFilters.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: '#2D7A4F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    marginLeft: 10,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2D7A4F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeFiltersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  activeFiltersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearFiltersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  todayBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  todayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  packageCountText: {
    fontSize: 14,
    color: '#95A5A6',
  },
  packagesList: {
    paddingHorizontal: 20,
  },
  mealSection: {
    marginBottom: 28,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  mealCount: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '600',
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  packageImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E8ECEF',
  },
  mealBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  mealBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  packageContent: {
    padding: 16,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  packageTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  packageName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C3E50',
  },
  packageDesc: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#95A5A6',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  itemsSection: {
    marginBottom: 14,
  },
  itemsScroll: {
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingRight: 10,
    borderRadius: 20,
    marginRight: 6,
  },
  itemChipImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  itemChipText: {
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 6,
    fontWeight: '500',
    maxWidth: 70,
  },
  moreChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    justifyContent: 'center',
  },
  moreChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4F',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  itemCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A4F',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D7A4F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  orderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  singlesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  singleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  singleImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#E8ECEF',
  },
  singleContent: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2D7A4F',
  },
  singleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  singleDesc: {
    fontSize: 11,
    color: '#95A5A6',
    marginBottom: 10,
    lineHeight: 16,
  },
  singleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singlePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D7A4F',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#2D7A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Out of Stock Styles
  singleCardDisabled: {
    opacity: 0.7,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 10,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  singlePriceDisabled: {
    color: '#95A5A6',
    textDecorationLine: 'line-through',
  },
  addButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2D7A4F',
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
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
    fontSize: 20,
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
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8ECEF',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  clearAllBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2D7A4F',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HomeScreen;
