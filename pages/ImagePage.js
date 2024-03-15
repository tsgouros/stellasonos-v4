import React, { useRef, useState } from "react";
import AntDesign from 'react-native-vector-icons/AntDesign';

import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
  PanResponder,
  Modal,
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

  console.log("initializing with:", name);

  // Create an instance of SuperImage
  const superImage = useRef(new SuperImage(image)).current;
  console.log("created superimage");

  const pan = useRef(new Animated.ValueXY()).current;
  const currentX = useRef(0);
  const currentY = useRef(0);

  const xPadding = 45;

  // calculating actual width and height of touch area
  const xMax = Dimensions.get("window").width / 2 - xPadding;
  const yMax = Dimensions.get("window").height / 6 + 125;

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
  const handleX = (delta) => {
    var newX =
      currentX.current + delta > xMax ? xMax : 
        currentX.current + delta < -xMax ? -xMax : currentX.current + delta;
    pan.setValue({ x: newX, y: currentY.current });
  };
  const handleY = (delta) => {
    var newY = currentY.current + delta > yMax ? yMax : 
        currentY.current + delta < -yMax ? -yMax : currentY.current + delta;
    pan.setValue({ x: currentX.current, y: newY });
  };

  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {image.title}: {"\n"}
              {image.description}
            </Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
            console.log("event:",event.nativeEvent.pageX, event.nativeEvent.pageY, event.nativeEvent.locationX, event.nativeEvent.locationY, yMax, xMax,  );
          }}
        >
       <Grayscale
         image={
              <Image
                style={{ width: 2*xMax, height: 2*yMax }}
                source={{uri: superImage.currentImage().image.src }}
                resizeMode={'contain'}
              />
            } 
        />
        </View>
      </View>

      <View style={styles.toolBar}>
        <AntDesign
          onPress={() => handleX(-10)}
          name="leftcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleX(10)}
          name="rightcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleY(-10)}
          name="upcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => handleY(10)}
          name="downcircleo"
          size={30}
          color="black"
        />
        <AntDesign
          onPress={() => setModalVisible(true)}
          name="infocirlceo"
          size={30}
          color="black"
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
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold",
  },
  circle: {
    height: 40,
    width: 40,
    backgroundColor: "blue",
    borderRadius: 50,
  },
  imageContainer: {
    width: Dimensions.get("window").width - 50,
    height: Dimensions.get("window").height / 1.3,
    backgroundColor: "#000",
    margin: 0,
    zIndex: -1,
    elevation: -1,
    position: "absolute",
  },
  tinyLogo: {
    flex: 1,
    width: null,
    height: null,
    margin: 0,
    maxHeight: "100%",
    maxWidth: "100%",
  },
  absolute: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  toolBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 350,
    paddingBottom: 30,
  },

  modalView: {
    margin: 20,
    backgroundColor: "white",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 2.5,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    padding: 5,
    elevation: 2,
    marginTop: 0,
  },
  buttonClose: {
    backgroundColor: "black",
    backgroundColor: "rgba(11, 127, 171, 0.7)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});
