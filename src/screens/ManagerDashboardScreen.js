import React from 'react';
import { Text, View } from 'react-native';

// Placeholder: built in Question 10.
export default function ManagerDashboardScreen({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Manager dashboard for {route.params?.user?.fullName}</Text>
    </View>
  );
}
