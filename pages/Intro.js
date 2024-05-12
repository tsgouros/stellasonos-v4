import { StatusBar } from 'react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

// Utils and other pages
import { ContainerStyles, ButtonStyles, TextStyles } from '../utils/styles';

export default function Intro({ navigation }) {
  return (
    <TouchableOpacity
      style={[ContainerStyles.defaultContainer, { padding: 20 }]} // Increased padding for larger touch target
      onPress={() => navigation.navigate('Home')}
      accessible={true}
      accessibilityLabel="Welcome!"
      accessibilityHint="Double tap anywhere to start."
      activeOpacity={1}
    >
      <Text style={TextStyles.blackTextSmall} accessibilityRole="text">Welcome! Tap anywhere to start.</Text>
      <StatusBar style="auto" />
    </TouchableOpacity>
  );
}

