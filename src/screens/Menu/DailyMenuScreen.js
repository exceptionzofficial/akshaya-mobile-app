import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { packagesAPI, singlesAPI } from '../../services/api';

const DailyMenuScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [weeklyPackages, setWeeklyPackages] = useState({});
  const [singleMeals, setSingleMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const weekDays = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 7, name: 'Sunday', short: 'Sun' },
  ];

  const currentDayIndex = new Date().getDay();
  const currentDay = weekDays[currentDayIndex === 0 ? 6 : currentDayIndex - 1].name;

  useEffect(() => {
    fetchMenuData();
    setSelectedDay(currentDay);
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch Packages
      const packagesRes = await packagesAPI.getAll();
      if (packagesRes.success) {
        const grouped = {};
        weekDays.forEach(day => { grouped[day.name] = []; });

        (packagesRes.data.packages || []).forEach(pkg => {
          if (grouped[pkg.day]) {
            grouped[pkg.day].push(pkg);
          }
        });
        setWeeklyPackages(grouped);
      }

      // Fetch Single Meals
      const singlesRes = await singlesAPI.getAll();
      if (singlesRes.success) {
        setSingleMeals(singlesRes.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenuData();
    setRefreshing(false);
  };

  const currentDayPackages = weeklyPackages[selectedDay] || [];

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
    const groups = {
      breakfast: [],
      lunch: [],
      dinner: []
    };

    currentDayPackages.forEach(pkg => {
      if (groups[pkg.mealType]) {
        groups[pkg.mealType].push(pkg);
      }
    });

    return groups;
  };

  const renderPackageCard = (pkg) => {
    const mealInfo = getMealTypeInfo(pkg.mealType);

    return (
      <TouchableOpacity
        key={pkg.id}
        style={styles.packageCard}
        onPress={() => navigation.navigate('Booking', { item: pkg, day: selectedDay, type: 'package' })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: pkg.image || 'https://via.placeholder.com/300' }} style={styles.packageImage} />

        <View style={[styles.mealBadge, { backgroundColor: mealInfo.color }]}>
          <Icon name={mealInfo.icon} size={12} color="#FFFFFF" />
          <Text style={styles.mealBadgeText}>{mealInfo.label}</Text>
        </View>

        <View style={styles.packageInfo}>
          <View style={styles.packageHeader}>
            <View style={styles.packageTitleContainer}>
              <Text style={styles.packageName} numberOfLines={1}>{pkg.name}</Text>
              <Text style={styles.packageDesc} numberOfLines={1}>{pkg.description || 'Delicious meal package'}</Text>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.packagePrice}>₹{pkg.price}</Text>
            </View>
          </View>

          {/* Items Preview */}
          {pkg.items && pkg.items.length > 0 && (
            <View style={styles.itemsPreview}>
              {pkg.items.slice(0, 3).map((item, idx) => (
                <View key={idx} style={styles.itemChip}>
                  <Image source={{ uri: getItemImage(item) }} style={styles.itemChipImage} />
                  <Text style={styles.itemChipText} numberOfLines={1}>{getItemName(item)}</Text>
                </View>
              ))}
              {pkg.items.length > 3 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{pkg.items.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.itemCountBadge}>
              <Icon name="layers-outline" size={14} color="#2D7A4F" />
              <Text style={styles.itemCountText}>{pkg.items?.length || 0} items</Text>
            </View>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => navigation.navigate('Booking', { item: pkg, day: selectedDay, type: 'package' })}
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
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.singleCard}
        onPress={() => navigation.navigate('Booking', { item, type: 'single' })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/200' }}
          style={styles.singleImage}
        />
        <View style={styles.singleContent}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          <Text style={styles.singleName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.singleDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.singleFooter}>
            <Text style={styles.singlePrice}>₹{item.price}</Text>
            <TouchableOpacity style={styles.addButton}>
              <Icon name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayButton = (day) => {
    const isSelected = selectedDay === day.name;
    const isToday = day.name === currentDay;
    const packageCount = (weeklyPackages[day.name] || []).length;

    return (
      <TouchableOpacity
        key={day.id}
        style={[
          styles.dayButton,
          isSelected && styles.dayButtonActive,
          isToday && !isSelected && styles.dayButtonToday
        ]}
        onPress={() => setSelectedDay(day.name)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayShort,
          isSelected && styles.dayShortActive,
          isToday && !isSelected && styles.dayShortToday
        ]}>
          {day.short}
        </Text>
        <Text style={[
          styles.dayNumber,
          isSelected && styles.dayNumberActive,
          isToday && !isSelected && styles.dayNumberToday
        ]}>
          {packageCount}
        </Text>
        <Text style={[
          styles.dayPackageLabel,
          isSelected && styles.dayPackageLabelActive,
        ]}>
          pkg
        </Text>
        {isToday && (
          <View style={styles.todayDot} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D7A4F" />
        <Text style={styles.loadingText}>Loading weekly menu...</Text>
      </View>
    );
  }

  const groupedPackages = getGroupedPackages();
  const totalDailyItems = currentDayPackages.length + singleMeals.length;

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Weekly Menu</Text>
            <Text style={styles.headerSubtitle}>Plan your meals ahead</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => onRefresh()}
          >
            <Icon name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {weekDays.map(day => renderDayButton(day))}
        </ScrollView>
      </View>

      {/* Menu Content */}
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
        {/* Selected Day Info */}
        <View style={styles.dayInfoBanner}>
          <View style={styles.dayInfoLeft}>
            <Icon name="calendar" size={20} color="#2D7A4F" />
            <Text style={styles.dayInfoText}>
              {selectedDay}'s Menu
            </Text>
          </View>
          <Text style={styles.dayInfoCount}>{totalDailyItems} items</Text>
        </View>

        {/* Meal Sections */}
        <View style={styles.sectionsContainer}>

          {/* Breakfast Section */}
          {groupedPackages.breakfast.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIconBg, { backgroundColor: '#FFF8E1' }]}>
                  <Icon name="sunny-outline" size={22} color="#FFB800" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>Breakfast</Text>
                  <Text style={styles.mealCount}>
                    {groupedPackages.breakfast.length} packages
                  </Text>
                </View>
              </View>
              {groupedPackages.breakfast.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Lunch Section */}
          {groupedPackages.lunch.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIconBg, { backgroundColor: '#FFEBEE' }]}>
                  <Icon name="restaurant-outline" size={22} color="#FF6347" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>Lunch</Text>
                  <Text style={styles.mealCount}>
                    {groupedPackages.lunch.length} packages
                  </Text>
                </View>
              </View>
              {groupedPackages.lunch.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Dinner Section */}
          {groupedPackages.dinner.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIconBg, { backgroundColor: '#F3E5F5' }]}>
                  <Icon name="moon-outline" size={22} color="#9B59B6" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>Dinner</Text>
                  <Text style={styles.mealCount}>
                    {groupedPackages.dinner.length} packages
                  </Text>
                </View>
              </View>
              {groupedPackages.dinner.map(pkg => renderPackageCard(pkg))}
            </View>
          )}

          {/* Single Meals Section */}
          {singleMeals.length > 0 && (
            <View style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIconBg, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="fast-food-outline" size={22} color="#2D7A4F" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>A La Carte</Text>
                  <Text style={styles.mealCount}>
                    {singleMeals.length} items
                  </Text>
                </View>
              </View>
              <View style={styles.singlesGrid}>
                {singleMeals.map(item => renderSingleCard(item))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {currentDayPackages.length === 0 && singleMeals.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No menu for {selectedDay}</Text>
              <Text style={styles.emptyText}>
                Menu items will be added soon. Check other days!
              </Text>
            </View>
          )}
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2D7A4F',
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginTop: -12,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  daySelector: {
    paddingHorizontal: 12,
  },
  dayButton: {
    width: 64,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8ECEF',
    position: 'relative',
  },
  dayButtonActive: {
    backgroundColor: '#2D7A4F',
    borderColor: '#2D7A4F',
  },
  dayButtonToday: {
    borderColor: '#FFB800',
    backgroundColor: '#FFF8E1',
  },
  dayShort: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  dayShortActive: {
    color: '#FFFFFF',
  },
  dayShortToday: {
    color: '#FFB800',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  dayNumberToday: {
    color: '#FFB800',
  },
  dayPackageLabel: {
    fontSize: 10,
    color: '#95A5A6',
    marginTop: 2,
  },
  dayPackageLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  todayDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  dayInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  dayInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayInfoText: {
    fontSize: 14,
    color: '#2D7A4F',
    fontWeight: '600',
    marginLeft: 10,
  },
  dayInfoCount: {
    fontSize: 12,
    color: '#2D7A4F',
    fontWeight: '500',
  },
  todayBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mealSection: {
    marginBottom: 28,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitleContainer: {
    marginLeft: 14,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  mealCount: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 2,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  packageImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E8ECEF',
  },
  packageInfo: {
    padding: 16,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  packageName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 13,
    color: '#95A5A6',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#95A5A6',
  },
  packagePrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D7A4F',
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
  itemsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingRight: 10,
    borderRadius: 20,
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
    color: '#2D7A4F',
    fontWeight: '600',
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
    justifyContent: 'center',
    backgroundColor: '#2D7A4F',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  emptyState: {
    alignItems: 'center',
    padding: 50,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DailyMenuScreen;
