import { StatusBar, Image, Text, View, Button, Dimensions, TouchableOpacity, TextInput, Keyboard } from "react-native";
import React, { useState } from "react";

// Utils and other pages
// import { ContainerStyles, ImageStyles, TextStyles } from "../utils/styles";

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Images from JSON
import images from "../images.json";

export default function Home({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState((currentIndex + 1).toString()); // Local state to handle input
  const maxIndex = images.images.length - 1;

  const handleInputChange = (text) => {
    setInputIndex(text); // Update local state
  };

  const handleSubmit = () => {
    const newIndex = parseInt(inputIndex) - 1; // Convert input to zero-based index
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex <= maxIndex) {
      setCurrentIndex(newIndex);
    } else {
      console.log("Input out of range");
      setInputIndex((currentIndex + 1).toString()); // Reset input to current index if out of range
    }
    Keyboard.dismiss(); // Dismiss the keyboard after input
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    if (newIndex <= maxIndex) {
      setCurrentIndex(newIndex);
      setInputIndex((newIndex + 1).toString());
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
      setInputIndex((newIndex + 1).toString());
    }
  };

  const navigateToImagePage = (image) => {
    navigation.navigate("ImagePage", { image: image });
    console.log("Navigating to Image page with image: " + image.title);
  };

  const goBack = () => {
    navigation.goBack(); 
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center', 
      backgroundColor: '#f5f5f5'
    },
    backButton: {
      position: 'absolute',
      // top: 40, 
      bottom: 40,
      left: 10,
      padding: 10,
      zIndex: 10 
    },
    image: {
      width: width * 0.9, 
      height: height * 0.3, 
      resizeMode: 'contain'
    },
    text: {
      marginTop: 10,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: '100%',
      marginTop: 20
    },
    button: {
      marginHorizontal: 20
    },
    input: {
      width: 40,
      height: 20,
      fontSize: 16,
      textAlign: 'center'
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity
        style={dynamicStyles.backButton}
        onPress={goBack}
        accessibilityLabel="Back"
        accessibilityHint="Button"
        accessible={true}>
        <Text>Back</Text>
      </TouchableOpacity>
      <Text style={dynamicStyles.text}>{images.images[currentIndex].title}</Text>
      <TouchableOpacity
        onPress={() => navigateToImagePage(images.images[currentIndex])}
        accessibilityLabel={`${images.images[currentIndex].description}. Double tap to play details.`}
        accessible={true}>
        <Image style={dynamicStyles.image} source={{ uri: images.images[currentIndex].src }} />
      </TouchableOpacity>
      <View style={dynamicStyles.buttonContainer}>
        <Button title="Previous" onPress={handlePrevious} disabled={currentIndex === 0} style={dynamicStyles.button} />
        <TextInput
          style={dynamicStyles.input}
          onChangeText={handleInputChange}
          value={inputIndex}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
          selectTextOnFocus={true} // Select all text on focus
          accessibilityLabel={`Image ${inputIndex} out of ${maxIndex + 1} images`}
        />
        <Button title="Next" onPress={handleNext} disabled={currentIndex === maxIndex} style={dynamicStyles.button} />
      </View>
      <StatusBar />
    </View>
  );
}

