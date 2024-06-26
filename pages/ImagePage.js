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
  NativeModules,
  Pressable,
} from "react-native";

console.log("====================================");

// This gets a blob of data from the PNG file written by
// react-native-filter-kit.
import RNFetchBlob from 'rn-fetch-blob';
const { fs } = RNFetchBlob;

// The blob appears to come as a base64 string. Buffer can decode that.
import { Buffer } from 'buffer';

// A library whose job to unpack a PNG-encoded blob.
import * as png from '@vivaxy/png';

import { Grayscale, Threshold, Brightness, GaussianBlur, BoxBlur, Sharpen,
         cleanExtractedImagesCache} from "react-native-image-filter-kit";

import SuperImage from '../utils/SuperImage.js';

export default function ImagePage({ route, navigation }) {
  const { image, name } = route.params;
  // 'name' seems generally undefined here.

  // Create an instance of SuperImage
  const superImage = useRef(new SuperImage(image)).current;

  const pan = useRef(new Animated.ValueXY()).current;

  const cursorState = useRef({ "prevX": 0,
                               "prevY": 0,
                               "prevTimeStamp": 0, }).current;

  var blob;
  var imageData;

  // calculate actual width and height of touch area
  const touchAreaWidth = Dimensions.get("window").width;
  const touchAreaHeight = Dimensions.get("window").height;

  //const imageWidth = useRef(touchAreaWidth).current;
  //const imageHeight = useRef(touchAreaHeight).current;

  return (
      <View
    style={styles.imageContainer}
    onResponderGrant={(event) => { 
      // Look for a double click (half-second)
      if (Math.abs(event.touchHistory.mostRecentTimeStamp - 
                   cursorState.prevTimeStamp) < 500) {
        navigation.goBack();
      }

      cursorState.prevX = event.nativeEvent.pageX;
      cursorState.prevY = event.nativeEvent.pageY;
      cursorState.prevTimeStamp = event.touchHistory.mostRecentTimeStamp;
    } }
    onStartShouldSetResponder={() => true}
    onMoveShouldSetResponder={() => true}
    onResponderTerminationRequest={() => false}
    onResponderMove={(event) => {
      pan.setValue({
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      });
      superImage.play(pan.x._value, pan.y._value);
    }} 
    onResponderRelease={() => {
      superImage.stopSound(); // Call stopSound when the finger is lifted
    }}
      >
      <Sharpen
    onFilteringError={ (event) => { console.log("+++",event); } }
    onExtractImage={ (event) => { 

      // event.nativeEvent.uri is the file written by filter-kit.
      RNFetchBlob.fs.readFile(event.nativeEvent.uri, 'base64')
        .then((data) => {
          // Use Buffer to decode the base64 and png to get the image data.
          imageData = png.decode(Buffer.from(data, 'base64'));

          // Pass the image data to the superImage object.
          superImage.performSegmentation(imageData);

          // Should probably clean the cache here.
          cleanExtractedImagesCache();
        });
    } }
    extractImageEnabled={ true }
    // image={<GaussianBlur
    //        radius={ 1 }
           image={
               <Image
             style={styles.image}
             source={{uri: superImage.currentImage().src }}
               />} 
    //        />}
    // amount={ 1 }
      />
      <Animated.View
    style={{
      transformOrigin: 'top left',
      transform: [
        {
          translateX: pan.x.interpolate({
            inputRange: [0, touchAreaWidth],
            outputRange: [-touchAreaWidth/2, touchAreaWidth/2],
            extrapolate: "clamp",
          }),
        },
        {
          translateY: pan.y.interpolate({
            inputRange: [0, 0, touchAreaHeight, touchAreaHeight],
            outputRange: [-touchAreaHeight+75, -touchAreaHeight+75, 75, 75],
            extrapolate: "clamp",
          }),
        },
      ],
    }}
    onStartShouldSetResponder={(event) => {
      false }}
    onMoveShouldSetResponder={(evt) => false }
    onResponderReject={(event) => {}}
    onResponderGrant={(event) => {}}
      >
      <View style={styles.circle} />
      </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    // backgroundColor: "#266",
    backgroundColor: "#FFFFFF",
    margin: 0,
    padding: 50,
    borderWidth: 12,
    // borderColor: "#F0A",
    borderColor: "#FFFFFF",
    position: "absolute",
    top: 0,
    left: 0, 
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    width: Dimensions.get("window").width,
  },
  circle: {
    height: 40,
    width: 40,
    backgroundColor: "pink",
    borderRadius: 50,
  },
});