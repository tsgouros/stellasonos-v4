import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

class SuperImage {
  constructor(image) {
    this.image = image;
    this.pan = useRef(new Animated.ValueXY()).current;
    this.canTriggerVibration = true; 
    this.initPanResponder();
  }

  initPanResponder() {
    this.panResponder = PanResponder.create({
      // activates PanResponder on movement gestures
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: Animated.event(
        [null, { dx: this.pan.x, dy: this.pan.y }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            // calls the play function with the current movement's x and y values
            this.play(gestureState.dx, gestureState.dy);
          },
        }
      ),

      // handles the release of the gesture and reset start position for the next gesture
      onPanResponderRelease: () => {
        this.pan.flattenOffset();
      },
    });
  }

  play(x, y) {
    // Check if we can trigger vibration to prevent frequent triggers
    if (this.canTriggerVibration) {
      // Check if the movement in either X or Y direction is significant
      if (Math.abs(x) < 100 && Math.abs(y) < 100) {
        // For smaller movements, trigger light haptic feedback
        this.triggerHaptic('impactLight');
      } else {
        // For larger movements, trigger heavy haptic feedback
        this.triggerHaptic('impactHeavy');
      }

      // Temporarily disable vibration to avoid spamming
      this.canTriggerVibration = false;

      // Re-enable vibration after a short delay
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000);
    }
  }

  // Triggers haptic feedback based on style
  triggerHaptic(style) {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: false,
      ignoreAndroidSystemSettings: true,
    });
  }
}

export default SuperImage;
