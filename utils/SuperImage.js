// import { Animated } from 'react-native';
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
// import { Player } from '@react-native-community/audio-toolkit';

// // Class to hold a single image, meant to be part of a stack of
// // images, in the 'SuperImage' class.
// class SubImage {

//   constructor(image) {
//     console.log("initializing SubImage");
//     this.image = image; // full image object passed from ImagePage
//   }

//   clone = async function() {
//     return(new SubImage(this.image));
//   }
// }


// // This class is meant to hold a whole collection of SubImages, each
// // corresponding to some component of an astronomical object. So we
// // can choose which one to display.
// class SuperImage {
//   constructor(image, name="") {

//     // Ultimately, the constructor ought to begin with a collection of
//     // images and a description of how to portray them. For now, it
//     // has a single image input, from which we make a single-image
//     // collection. So this part is temporary.
//     var subImage = new SubImage(image);
//     var imageKey=name;
//     if (imageKey == "") imageKey = "1"; 
//     this.images = new Array();  // a collection of SubImage objects.
//     this.images[imageKey] = subImage;   // Load the first one.
//     console.log("initializing superImage", Object.keys(this.images));
//     this.currentImageKey = Object.keys(this.images)[0];
//     console.log("first image is called:", this.currentImageKey);
//     // Previous lines are temporary.

//     // A single segment record corresponds to a region of the
//     // segmented image. It records a measure of the segment's size and
//     // color, and also an index into the tables for the sound and
//     // vibrations to be played for that segment. This is a prototype
//     // record to be used as a model. It is also the empty record
//     // returned when there is no object at that pixel position. 
//     this.segmentRecord = {sum: 0, color: 0, haptic: 0, sound: 0};

//     // This is a collection of records corresponding to the objects in
//     // an image. The zero record is the empty record.
//     this.segmentRecords = new Map();
//     this.segmentRecords.set(0, Object.assign({}, this.segmentRecord));

//     this.pan = new Animated.ValueXY(); // handling drag movements
//     this.canTriggerVibration = true; // control vibration feedback frequency
//     this.soundUrl = "https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3"; // URL for sound effect
//     this.initialVolume = 0.5; // initial sound volume
//     this.soundPlayer = new Player(this.soundUrl, {
//       autoDestroy: false
//     }).prepare((err) => {
//       if (!err) {
//         this.soundPlayer.volume = this.initialVolume;
//       }
//     });

//     // placeholder for segmented image data
//     /// this.images['segmented'] = null;
    
//     // segmentation logic will populate this.segmentedImage with processed data
//     this.performSegmentation();
//   }

//   addImage(image, name="") {
//     var imageKey = name;
//     if (imageKey == "") imageKey=this.images.length.toString();
    
//     this.images[imageKey] = image;
//   }

//   currentImage() {
//     return(this.images[this.currentImageKey]);
//   }
  
//   performSegmentation() {
//     console.log("Performing segmentation on the image");
//     // segmentation logic here
//   }

//   // Retrieve one or more of the segment records corresponding to this
//   // screen position. These records will be used to decide what sounds
//   // and vibrations to play.
//   getRecords(x, y) {
//     console.log("getting segmentation records");
//   }

//   // Depending on where the user interacts with the image (determined
//   // by the gesture's x, y coordinates) to trigger different sounds or
//   // haptic feedback based on segment
//   play(x, y) {
//     // need to incorporate logic to check the segmentation data
//     console.log("playing at:", x.toFixed(2), y.toFixed(2));

//     const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 
//           'impactHeavy';
//     if (this.canTriggerVibration) {
//       console.log(`Triggering Haptic with style: ${style}`);
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

//   triggerSound() {
//     this.soundPlayer.play(() => {
//       console.log("Sound started.");
//     });
//   }

//   stopSound() {
//     if (this.soundPlayer.isPlaying) {
//       this.soundPlayer.stop();
//     }
//   }

//   triggerHaptic(style) {
//     ReactNativeHapticFeedback.trigger(style, {
//       enableVibrateFallback: true,
//       ignoreAndroidSystemSettings: false,
//     });
//     console.log(`Haptic feedback triggered: ${style}`);
//   }

//   componentWillUnmount() {
//     if (this.soundPlayer) {
//       this.soundPlayer.destroy();
//     }
//   }
// }

// export default SuperImage;

import { Animated } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';

class SubImage {
  constructor(image) {
    console.log("initializing SubImage");
    this.image = image; // full image object passed from ImagePage
  }

  clone = async function() {
    return new SubImage(this.image);
  }
}

class SuperImage {
  constructor(image, name = "") {
    var subImage = new SubImage(image);
    var imageKey = name;
    if (imageKey === "") imageKey = "1";
    this.images = {}; // a collection of SubImage objects
    this.images[imageKey] = subImage; // Load the first one
    console.log("initializing SuperImage", Object.keys(this.images));
    this.currentImageKey = Object.keys(this.images)[0];
    
    this.segmentRecord = { sum: 0, color: 0, haptic: 0, sound: 0 };
    this.segmentRecords = new Map();
    this.segmentRecords.set(0, Object.assign({}, this.segmentRecord));
    
    this.pan = new Animated.ValueXY();
    this.canTriggerVibration = true;
    this.soundUrl = "https://stellasonos-files.vercel.app/samples/bassoon/G1.mp3";
    this.initialVolume = 0.5;

    // Initialize two sound players
    this.playerOne = new Player(this.soundUrl, { autoDestroy: false }).prepare();
    this.playerTwo = new Player(this.soundUrl, { autoDestroy: false }).prepare();
    this.playerOne.volume = this.initialVolume;
    this.playerTwo.volume = this.initialVolume;

    this.activePlayer = this.playerOne;
    this.nextPlayer = this.playerTwo;
    this.isPlayerOneActive = true;

    this.switchInterval = 5000; // Switch every 6999 milliseconds

    this.performSegmentation();
  }

  addImage(image, name = "") {
    var imageKey = name;
    if (imageKey === "") imageKey = Object.keys(this.images).length.toString();
    this.images[imageKey] = new SubImage(image);
  }

  currentImage() {
    return this.images[this.currentImageKey];
  }

  performSegmentation() {
    console.log("Performing segmentation on the image");
    // Segmentation logic here
  }

  play(x, y) {
    console.log("playing at:", x.toFixed(2), y.toFixed(2));
    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
    if (this.canTriggerVibration) {
      console.log(`Triggering Haptic with style: ${style}`);
      ReactNativeHapticFeedback.trigger(style, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      this.canTriggerVibration = false;
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000); // reset haptic trigger flag after a delay
    }

    if (!this.activePlayer.isPlaying) {
      this.activePlayer.play();
      this.scheduleSwitch();
    }
  }

  scheduleSwitch() {
    setTimeout(() => {
      this.switchPlayer();
      this.activePlayer.play();
      if (this.activePlayer.currentTime < this.switchInterval - 100) {
        // If we switched players before reaching the switchInterval,
        // it's probably because the user stopped and replayed the sound.
        // In such a case, reschedule the switch.
        this.scheduleSwitch();
      }
    }, this.switchInterval);
  }

  switchPlayer() {
    this.isPlayerOneActive = !this.isPlayerOneActive;
    this.activePlayer = this.isPlayerOneActive ? this.playerOne : this.playerTwo;
    this.nextPlayer = this.isPlayerOneActive ? this.playerTwo : this.playerOne;
  }

  stopSound() {
    this.playerTwo.stop();
    this.playerOne.stop();
  }

  componentWillUnmount() {
    this.playerOne.destroy();
    this.playerTwo.destroy();
  }
}

export default SuperImage;
