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

import * as _Jimp from 'jimp';
const Jimp = (typeof self !== 'undefined') ? (self.Jimp || _Jimp) : _Jimp;
// const jp = new Jimp(256, 256, "#000000", (err, image) => {
//   console.log("EEEEEEE", err);
// });
// console.log("----", Object.keys(jp.bitmap));

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
  const xMax = Dimensions.get("window").width;
  const yMax = Dimensions.get("window").height;

  return (
    <View style={styles.container}>
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
              x: event.nativeEvent.pageX - 25,
              y: event.nativeEvent.pageY + 25,
            });
            superImage.play(pan.x._value, pan.y._value);
          }}
        >
      <Sharpen
        onFilteringError={ (event) => { console.log("+++",event); } }
        onExtractImage={ (event) => { 
          console.log("===",event.nativeEvent.uri, event.nativeEvent.target,Object.keys(event.nativeEvent));
          // event.nativeEvent.uri is the file written by filter-kit.
          RNFetchBlob.fs.readFile(event.nativeEvent.uri, 'base64')
          .then((data) => {
            // Use Buffer to decode the base64 and png to get the image data.
            imageData = png.decode(Buffer.from(data, 'base64'));
            console.log("image data:", Object.keys(imageData));
            // The size checks out from the original image. 3/21/24.
            console.log("image size", imageData.width, imageData.height, imageData.depth, imageData.colorType, typeof imageData.data[1]);
            jp = new Jimp(imageData.width, imageData.height, 
                          (e, j) => { 
                            console.log("JIMP success?", e, Object.keys(j.bitmap), j.bitmap.width, j.bitmap.height, typeof j.bitmap.data[1]);

                          });

            // Should probably clean the cache here.
            cleanExtractedImagesCache();
          });
        } }
    extractImageEnabled={ true }
    image={<GaussianBlur
           radius={ 1 }
           image={
               <Image
             style={{ width: xMax, height: yMax }}
             source={{uri: superImage.currentImage().image.src }}
               />} 
           />}
    amount={ 1 }
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
