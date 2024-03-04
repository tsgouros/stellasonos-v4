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
      // activates PanResponder on movement gestures
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
      console.log(`Triggering Haptic with style: ${style}`); // debug
      this.triggerHaptic(style);
      
      // sound player
      this.triggerSound();

      this.canTriggerVibration = false;
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000); 
    }
  }

  triggerHaptic(style) {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  }

  triggerSound() {
    if (this.soundPlayer.isPlaying) {
        console.log("Stopping sound..."); // log before stopping sound
        this.soundPlayer.stop(() => {
            console.log("Sound stopped."); // log after sound has stopped
            this.soundPlayer.play(() => {
                console.log("Sound started."); // log when sound starts again after stopping
            });
        });
    } else {
        console.log("Starting sound..."); // Log before playing sound for the first time
        this.soundPlayer.play(() => {
            console.log("Sound started."); // log when sound starts
        });
    }
}

  componentWillUnmount() {
    // release
    if (this.soundPlayer) {
      this.soundPlayer.destroy();
    }
  }
}

export default SuperImage;


