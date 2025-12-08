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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { packagesAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [packageMeals, setPackageMeals] = useState([]);
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
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: '#FFB800' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline', color: '#FF6347' },
    { id: 'dinner', label: 'Dinner', icon: 'moon-outline', color: '#9B59B6' },
    { id: 'salad', label: 'Salads', icon: 'leaf-outline', color: '#27AE60' },
    { id: 'soup', label: 'Soups', icon: 'water-outline', color: '#3498DB' },
    { id: 'rice', label: 'Rice', icon: 'grid-outline', color: '#E67E22' },
    { id: 'curry', label: 'Curry', icon: 'flame-outline', color: '#E74C3C' },
    { id: 'dessert', label: 'Desserts', icon: 'ice-cream-outline', color: '#9B59B6' },
  ];

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    try {
      setLoading(true);
      const packagesRes = await packagesAPI.getByDay(today);
      if (packagesRes.success) {
        setPackageMeals(packagesRes.data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayMenu();
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
        // Check meal type
        if (selectedFilters.includes(item.mealType)) return true;
        // Check if any item name matches filter
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

  const getMealTypeInfo = (mealType) => {
    const types = {
      breakfast: { icon: 'sunny-outline', color: '#FFB800', label: 'Breakfast' },
      lunch: { icon: 'restaurant-outline', color: '#FF6347', label: 'Lunch' },
      dinner: { icon: 'moon-outline', color: '#9B59B6', label: 'Dinner' }
    };
    return types[mealType] || types.lunch;
  };

  const getItemName = (item) => typeof item === 'string' ? item : item?.name || 'Item';
  const getItemImage = (item) => typeof item === 'string' ? 'https://via.placeholder.com/150' : (item?.image || 'https://via.placeholder.com/150');

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

        {/* Meal Type Badge */}
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

          {/* Items Preview */}
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7A4F" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  const filteredPackages = getFilteredPackages();

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
            {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'}
          </Text>
        </View>

        {/* Packages List */}
        <View style={styles.packagesList}>
          {filteredPackages.length > 0 ? (
            filteredPackages.map(item => renderPackageCard(item))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="fast-food-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery || selectedFilters.length > 0
                  ? 'No matching packages'
                  : 'No packages available'}
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
              <Text style={styles.modalTitle}>Filter Packages</Text>
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

              <Text style={styles.filterSectionTitle}>Food Type</Text>
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
