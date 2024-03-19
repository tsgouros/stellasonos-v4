import React, { useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
  Alert,
  Text,
  Image,
  ImageBackground,
  Pressable,
} from "react-native";

import { Grayscale, Threshold } from "react-native-image-filter-kit";

import SuperImage from '../utils/SuperImage.js';

export default function ImagePage({ route, navigation }) {
  const { image, name } = route.params;
  // 'name' seems generally undefined here.

  // Create an instance of SuperImage
  const superImage = useRef(new SuperImage(image)).current;

  const pan = useRef(new Animated.ValueXY()).current;

  // calculate actual width and height of touch area
  const xMax = Dimensions.get("window").width;
  const yMax = Dimensions.get("window").height;

// Q: Can we add a background image with the same properties as the image
// and do the segmentation on it? With a fully opaque image in front
// of it, who would know? 
//
// A: Apparently we can, see below. The order of objects within a view
// apparently matters, so put the image you want to see (and its
// accompanying Animated.View) first, followed by the
// ImageBackground. (Not sure it matters whether the second is Image
// or ImageBackground, so if the latter gives trouble, try the
// former.)


  return (
    <View style={styles.container}>
        <View
          style={styles.imageContainer}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderMove={(event) => {            
            pan.setValue({
              x: event.nativeEvent.pageX - 25,
              y: event.nativeEvent.pageY + 25,
            });
            superImage.play(pan.x._value, pan.y._value);
          }}
        >
      <Image
          style={{ width: xMax*2, height: yMax }}
          source={{uri: superImage.currentImage().image.src }}
      /> 
        <Animated.View
          style={{
            transformOrigin: 'top left',
            transform: [
              {
                translateX: pan.x.interpolate({
                  inputRange: [0, xMax],
                  outputRange: [0, xMax],
                  extrapolate: "clamp",
                }),
              },
              {
                translateY: pan.y.interpolate({
                  inputRange: [0, 110, yMax-110, yMax],
                  outputRange: [-yMax+200, -yMax+200, 0, 0],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
    onStartShouldSetResponder={(event) => {
      pan.setValue({x: event.nativeEvent.pageX - 25,
                    y: event.nativeEvent.pageY + 25,
                   });
      false }}
    onMoveShouldSetResponder={(evt) => false }
    onResponderReject={(event) => {}}
    onResponderGrant={(event) => {}}
        >
          <View style={styles.circle} />
        </Animated.View>
      <Threshold
      image={<Grayscale
        image={
           <Image
          style={{ width: xMax*2, height: yMax }}
          source={{uri: superImage.currentImage().image.src }}
            />} 
      />}
       amount={ 4 }
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
