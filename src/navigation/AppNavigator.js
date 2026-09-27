import React, { useMemo } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { navigationRef } from './navigationRef';

import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MenuStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const ReserveStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

// Header colours for every nested stack come from the theme.
function useStackOptions() {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '800' },
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors]
  );
}

function MenuStackScreen() {
  const options = useStackOptions();
  return (
    <MenuStack.Navigator screenOptions={options}>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
    </MenuStack.Navigator>
  );
}

function CartStackScreen() {
  const options = useStackOptions();
  return (
    <CartStack.Navigator screenOptions={options}>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'Your cart' }} />
      <CartStack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Order summary' }} />
    </CartStack.Navigator>
  );
}

function ReserveStackScreen() {
  const options = useStackOptions();
  return (
    <ReserveStack.Navigator screenOptions={options}>
      <ReserveStack.Screen name="Reservation" component={ReservationScreen} options={{ title: 'Book a table' }} />
    </ReserveStack.Navigator>
  );
}

function ProfileStackScreen() {
  const options = useStackOptions();
  return (
    <ProfileStack.Navigator screenOptions={options}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function DashboardStackScreen() {
  const options = useStackOptions();
  return (
    <DashboardStack.Navigator screenOptions={options}>
      <DashboardStack.Screen name="Dashboard" component={ManagerDashboardScreen} options={{ title: 'Manager dashboard' }} />
    </DashboardStack.Navigator>
  );
}

const TAB_ICONS = {
  MenuTab: 'restaurant',
  CartTab: 'cart',
  ReserveTab: 'calendar',
  DashboardTab: 'speedometer',
  ProfileTab: 'person',
};

function MainTabs() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { colors } = useTheme();
  const isManager = user?.role === 'manager';

  return (
    <Tab.Navigator
      initialRouteName={isManager ? 'DashboardTab' : 'MenuTab'}
      screenOptions={({ route }) => ({
        headerShown: false, // each tab has its own stack header
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      {/* Role-based tabs: the Dashboard only exists for managers. */}
      {isManager ? (
        <Tab.Screen name="DashboardTab" component={DashboardStackScreen} options={{ title: 'Dashboard' }} />
      ) : (
        <>
          <Tab.Screen name="MenuTab" component={MenuStackScreen} options={{ title: 'Menu' }} />
          <Tab.Screen
            name="CartTab"
            component={CartStackScreen}
            options={{
              title: 'Cart',
              tabBarBadge: itemCount > 0 ? itemCount : undefined, // live item count badge
              tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.primaryText },
            }}
          />
          <Tab.Screen name="ReserveTab" component={ReserveStackScreen} options={{ title: 'Reserve' }} />
        </>
      )}
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
