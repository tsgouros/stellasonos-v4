import { Animated, PanResponder } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';

class SuperImage {
  constructor(image) {
    this.image = image;
    this.pan = new Animated.ValueXY();
    this.canTriggerVibration = true;
    this.soundUrl = "https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3";
    this.initialVolume = 0.5;
    this.soundPlayer = new Player(this.soundUrl, {
      autoDestroy: false
    }).prepare((err) => {
      if (!err) {
        this.soundPlayer.volume = this.initialVolume;
      }
    });

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
        this.stopSound(); // call stopSound when the user lifts their finger
      },
    });
  }

  play(x, y) {
    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
    if (this.canTriggerVibration) {
      console.log(`Triggering Haptic with style: ${style}`); // Display haptic trigger style
      this.triggerHaptic(style);
      this.canTriggerVibration = false;
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000); // reset haptic trigger flag after a delay
    }

    if (!this.soundPlayer.isPlaying) {
      console.log("Starting sound..."); // log before playing sound
      this.triggerSound();
    }
  }

  triggerHaptic(style) {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    console.log(`Haptic feedback triggered: ${style}`); // confirm haptic feedback was triggered
  }

  triggerSound() {
    this.soundPlayer.play(() => {
      console.log("Sound started."); // log when sound starts
    });
  }

  stopSound() {
    if (this.soundPlayer.isPlaying) {
      console.log("Stopping sound..."); // log before stopping sound
      this.soundPlayer.stop(() => {
        console.log("Sound stopped."); // log after sound has stopped
      });
    }
  }

  componentWillUnmount() {
    if (this.soundPlayer) {
      this.soundPlayer.destroy();
    }
  }
}

export default SuperImage;
