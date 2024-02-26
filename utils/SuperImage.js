import { Animated, PanResponder } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

class SuperImage {
  constructor(image) {
    this.image = image;
    this.pan = new Animated.ValueXY();
    this.canTriggerVibration = true;
    this.initPanResponder();
  }

  initPanResponder() {
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: this.pan.x, dy: this.pan.y }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            this.play(gestureState.dx, gestureState.dy);
          },
        }
      ),
      onPanResponderRelease: () => {
        this.pan.flattenOffset();
      },
    });
  }

  play(x, y) {
    if (this.canTriggerVibration) {
      const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
      console.log(`Triggering Haptic with style: ${style}`); // Debug log
      this.triggerHaptic(style);

      this.canTriggerVibration = false;
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000); // Ensure this timeout matches or exceeds the library's internal cooldown, if any
    }
  }

  triggerHaptic(style) {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  }
}

export default SuperImage;

