// import { Animated, PanResponder } from 'react-native';
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
// import { Player } from '@react-native-community/audio-toolkit';

// class SuperImage {
//   constructor(image) {
//     this.image = image;
//     this.pan = new Animated.ValueXY();
//     this.canTriggerVibration = true;
//     this.soundUrl = "https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3";
//     this.initialVolume = 0.5;
//     this.soundPlayer = new Player(this.soundUrl, {
//       autoDestroy: false
//     }).prepare((err) => {
//       if (!err) {
//         this.soundPlayer.volume = this.initialVolume;
//       }
//     });

//     this.initPanResponder();
//   }

//   initPanResponder() {
//     this.panResponder = PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event(
//         [null, { dx: this.pan.x, dy: this.pan.y }],
//         {
//           useNativeDriver: false,
//           listener: (event, gestureState) => {
//             this.play(gestureState.dx, gestureState.dy);
//           },
//         }
//       ),
//       onPanResponderRelease: () => {
//         this.pan.flattenOffset();
//         this.stopSound(); // call stopSound when the user lifts their finger
//       },
//     });
//   }

//   play(x, y) {
//     const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
//     if (this.canTriggerVibration) {
//       console.log(`Triggering Haptic with style: ${style}`); // Display haptic trigger style
//       this.triggerHaptic(style);
//       this.canTriggerVibration = false;
//       setTimeout(() => {
//         this.canTriggerVibration = true;
//       }, 1000); // reset haptic trigger flag after a delay
//     }

//     if (!this.soundPlayer.isPlaying) {
//       console.log("Starting sound..."); // log before playing sound
//       this.triggerSound();
//     }
//   }

//   triggerHaptic(style) {
//     ReactNativeHapticFeedback.trigger(style, {
//       enableVibrateFallback: true,
//       ignoreAndroidSystemSettings: false,
//     });
//     console.log(`Haptic feedback triggered: ${style}`); // confirm haptic feedback was triggered
//   }

//   triggerSound() {
//     this.soundPlayer.play(() => {
//       console.log("Sound started."); // log when sound starts
//     });
//   }

//   stopSound() {
//     if (this.soundPlayer.isPlaying) {
//       console.log("Stopping sound..."); // log before stopping sound
//       this.soundPlayer.stop(() => {
//         console.log("Sound stopped."); // log after sound has stopped
//       });
//     }
//   }

//   componentWillUnmount() {
//     if (this.soundPlayer) {
//       this.soundPlayer.destroy();
//     }
//   }
// }

// export default SuperImage;

// import { Animated, PanResponder } from 'react-native';
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
// import { Player } from '@react-native-community/audio-toolkit';

// class SuperImage {
//   constructor(image) {
//     this.image = image; // This is the full image object passed from ImagePage
//     this.pan = new Animated.ValueXY();
//     this.canTriggerVibration = true;
//     this.soundUrl = "https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3";
//     this.initialVolume = 0.5;
//     this.soundPlayer = new Player(this.soundUrl, {
//       autoDestroy: false
//     }).prepare((err) => {
//       if (!err) {
//         this.soundPlayer.volume = this.initialVolume;
//       }
//     });

//     this.initPanResponder();
//     this.segmentedImage = null; // Placeholder for segmented image data
//     this.performSegmentation();
//   }

//   performSegmentation() {
//     // Placeholder for segmentation logic
//     // Assuming segmentation logic populates this.segmentedImage with processed data
//     // This could be an algorithm that segments the image based on layers, colors, etc.
//     console.log("Performing segmentation on the image");
//     // Update this.segmentedImage with segmentation results
//   }

//   initPanResponder() {
//     this.panResponder = PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event(
//         [null, { dx: this.pan.x, dy: this.pan.y }],
//         {
//           useNativeDriver: false,
//           listener: (event, gestureState) => {
//             this.play(gestureState.dx, gestureState.dy);
//           },
//         }
//       ),
//       onPanResponderRelease: () => {
//         this.pan.flattenOffset();
//         this.stopSound(); // call stopSound when the user lifts their finger
//       },
//     });
//   }

//   play(x, y) {
//     const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
//     if (this.canTriggerVibration) {
//       console.log(`Triggering Haptic with style: ${style}`);
//       this.triggerHaptic(style);
//       this.canTriggerVibration = false;
//       setTimeout(() => {
//         this.canTriggerVibration = true;
//       }, 1000);
//     }

//     if (!this.soundPlayer.isPlaying) {
//       console.log("Starting sound...");
//       this.triggerSound();
//     }
//   }

//   triggerHaptic(style) {
//     ReactNativeHapticFeedback.trigger(style, {
//       enableVibrateFallback: true,
//       ignoreAndroidSystemSettings: false,
//     });
//     console.log(`Haptic feedback triggered: ${style}`);
//   }

//   triggerSound() {
//     this.soundPlayer.play(() => {
//       console.log("Sound started.");
//     });
//   }

//   stopSound() {
//     if (this.soundPlayer.isPlaying) {
//       console.log("Stopping sound...");
//       this.soundPlayer.stop(() => {
//         console.log("Sound stopped.");
//       });
//     }
//   }

//   componentWillUnmount() {
//     if (this.soundPlayer) {
//       this.soundPlayer.destroy();
//     }
//   }
// }

// export default SuperImage;

import { Animated, PanResponder } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';

class SuperImage {
  constructor(image) {
    this.image = image; // full image object passed from ImagePage
    this.pan = new Animated.ValueXY(); // handling drag movements
    this.canTriggerVibration = true; // control vibration feedback frequency
    this.soundUrl = "https://your-sound-url-here.mp3"; //url for sound effect
    this.initialVolume = 0.5; // initial sound volume
    this.soundPlayer = new Player(this.soundUrl, {
      autoDestroy: false
    }).prepare((err) => {
      if (!err) {
        this.soundPlayer.volume = this.initialVolume;
      }
    });

    // placeholder for segmented image data
    this.segmentedImage = null;

    // initialize PanResponder for drag interactions
    this.initPanResponder();

    // segmentation logic will populate this.segmentedImage with processed data
    this.performSegmentation();
  }

  
  performSegmentation() {
    console.log("Performing segmentation on the image");
    // segmentation logic here
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
        this.stopSound();
      },
    });
  }

  // Depending on where the user interacts with the image (determined
  // by the gesture's x, y coordinates) to trigger different sounds or
  // haptic feedback based on segment
  play(x, y) {
    // need to incorporate logic to check the segmentation data

    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
    if (this.canTriggerVibration) {
      console.log(`Triggering Haptic with style: ${style}`);
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

  triggerSound() {
    this.soundPlayer.play(() => {
      console.log("Sound started.");
    });
  }

  stopSound() {
    if (this.soundPlayer.isPlaying) {
      this.soundPlayer.stop();
    }
  }

  triggerHaptic(style) {
    ReactNativeHapticFeedback.trigger(style, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    console.log(`Haptic feedback triggered: ${style}`);
  }

  componentWillUnmount() {
    if (this.soundPlayer) {
      this.soundPlayer.destroy();
    }
  }
}

export default SuperImage;

/* 

IMPORTANT: some challenges i noticed so far 

* web context: images can be dynamically loaded and manipulated at pixel level using libraries like image-js
* let image = await IJS.Image.load(document.getElementById('colorTwo').src);
here an image is loaded into a format that can be directly manipulated but 
direct pixel manipulation is unsupported in react native because native interfaces have native ui componentsand and lacks a DOM

* react native doesnt support grayscale conversion, convolution with a kernel array, and flood fill for segmentation
all of which are in the javascript code: 

gray scale conversion
this.images['segmented'] = await this.images[imageKey].clone();
this.images['segmented'].image = this.images[imageKey].image.grey();

convolution
this.img = this.img
  .resize({width: 550, height: 550})
  .convolution(kernelArray)
  .erode({number: 1}).dilate({number: 1})
  .resize({width: this.images[imageKey].image.width, height: this.images[imageKey].image.height})
  .mask({threshold: 0.25, invert: true});

flood fill 
this.segmentRecords.get(objectID).sum = this.floodFill(i, j, objectID);

* might be necessary to look into react-native-image-filter-kit or custom native modules?
*/

