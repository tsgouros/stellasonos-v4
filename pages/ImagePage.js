import React, { useRef, useState } from "react";
import AntDesign from 'react-native-vector-icons/AntDesign';

import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
  PanResponder,
  Alert,
  Text,
  Image,
  ImageBackground,
  Pressable,
} from "react-native";

import { Grayscale } from "react-native-image-filter-kit";

import SuperImage from '../utils/SuperImage.js';

export default function ImagePage({ route, navigation }) {
  const { image, name } = route.params;
  // 'name' seems generally undefined here.

  // Create an instance of SuperImage
  const superImage = useRef(new SuperImage(image)).current;

  const pan = useRef(new Animated.ValueXY()).current;
  const currentX = useRef(0);
  const currentY = useRef(0);

  // calculate actual width and height of touch area
  const xMax = Dimensions.get("window").width/2;
  const yMax = Dimensions.get("window").height/2;

  // total dimensions of window.

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,

      // prevent the dot (point of interest) from moving out of
      // bounds with simple ternary operators
      onPanResponderGrant: (e, r) => {
        pan.setOffset({
          x: pan.x._value > xMax ? xMax : 
            pan.x._value < -xMax ? -xMax : pan.x._value,
          y: pan.y._value > yMax ? yMax : 
            pan.y._value < -yMax ? -yMax : pan.y._value,
        });
      },

      // panResponder calls superImage.play during movements
      onPanResponderMove: (e, gestureState) => {
        console.log("playing........");
        superImage.play(gestureState.dx, gestureState.dy);
        Animated.event([null, { dx: pan.x, dy: pan.y }], 
                       { useNativeDriver: false })(e, gestureState);
      },

      onPanResponderRelease: (e, r) => {
        pan.flattenOffset();
        currentY.current = pan.y._value;
        currentX.current = pan.x._value;
      },
    })
  ).current;

  // update current x and y values in the state for later
  pan.x.addListener(({ value }) => { currentX.current = value; });
  pan.y.addListener(({ value }) => { currentY.current = value; });

  return (
    <View style={styles.container}>
      {/* Preventing the dot from going out of bounds       */}
        <Animated.View
          style={{
            transform: [
              {
                translateX: pan.x.interpolate({
                  inputRange: [-xMax, xMax],
                  outputRange: [-xMax, xMax],
                  extrapolate: "clamp",
                }),
              },
              {
                translateY: pan.y.interpolate({
                  inputRange: [-yMax, yMax],
                  outputRange: [-yMax, yMax],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.circle} />
        </Animated.View>
        <View
          style={styles.imageContainer}
          onStartShouldSetResponder={() => true}
          onResponderMove={(event) => {            
            pan.setValue({
              x: event.nativeEvent.locationX - xMax - 20,
              y: event.nativeEvent.locationY - yMax - 20,
            });
            console.log("event:",
                        "pageX:",event.nativeEvent.pageX.toFixed(2), 
                        "pageY:",event.nativeEvent.pageY.toFixed(2), 
                        "locX:",event.nativeEvent.locationX.toFixed(2), 
                        "locY:",event.nativeEvent.locationY.toFixed(2), 
                        "xMax:",xMax, 
                        "yMax:",yMax,
                        "panX:",pan.x._value.toFixed(2),
                        "panY:",pan.y._value.toFixed(2),
                        Dimensions.get("window").width,
                        Dimensions.get("window").height,
                       );
          }}
        >
         <Image 
            style={styles.image}
            source={{ uri: superImage.currentImage().image.src }} 
         />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    height: 40,
    width: 40,
    backgroundColor: "pink",
    borderRadius: 50,
  },
  imageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 1.3,
    backgroundColor: "#000",
    margin: 0,
    zIndex: -1,
    elevation: -1,
    position: "absolute",
    borderWidth: 2,
    borderColor: "#F0F"
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    margin: 0,
    maxHeight: "100%",
    maxWidth: "100%",
  },
});
