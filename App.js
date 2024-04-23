import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react'

// Navigation-related imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Utils and other pages
import Intro from './pages/Intro';
import Home from './pages/Home';
import ImagePage from './pages/ImagePage.js';

const Stack = createNativeStackNavigator();

const SELECTED_IMAGE = 7
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false  // Hide the app header
        }}>
        <Stack.Screen name="Intro" component={Intro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ImagePage" component={ImagePage} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});