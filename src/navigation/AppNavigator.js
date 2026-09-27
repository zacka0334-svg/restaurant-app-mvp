import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Dashboard" component={ManagerDashboardScreen} options={{ title: 'Manager dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
