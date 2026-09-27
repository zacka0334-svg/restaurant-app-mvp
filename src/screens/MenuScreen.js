import React from 'react';
import { Text, View } from 'react-native';

// Placeholder: built in Question 4.
export default function MenuScreen({ route }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome {route.params?.user?.fullName}! Menu coming soon.</Text>
    </View>
  );
}
