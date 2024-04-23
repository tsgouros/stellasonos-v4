import { StatusBar } from 'react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react'

// Utils and other pages
import { ContainerStyles, ButtonStyles, TextStyles } from '../utils/styles';

export default function Intro({ navigation }) {
  return (
    <TouchableOpacity
      style={ContainerStyles.defaultContainer}
      onPress={() => navigation.navigate('Home')}
      activeOpacity={1} 
    >
      <Text style={TextStyles.blackTextSmall}>Welcome! Tap anywhere to start.</Text>
      <StatusBar style="auto" />
    </TouchableOpacity>
  );
}
