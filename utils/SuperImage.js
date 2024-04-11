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

    this.isPlaying = false; // New state control
    this.switchInterval = 5000; // Time between automatic player switches

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
    this.isPlaying = true; // Set isPlaying to true to allow sound
    console.log("playing at:", x.toFixed(2), y.toFixed(2));
    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
    if (this.canTriggerVibration) {
      ReactNativeHapticFeedback.trigger(style, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      this.canTriggerVibration = false;
      setTimeout(() => {
        this.canTriggerVibration = true;
      }, 1000); // Reset haptic trigger flag after a delay
    }

    if (!this.activePlayer.isPlaying && this.isPlaying) {
      this.activePlayer.play();
      this.scheduleSwitch();
    }
  }

  scheduleSwitch() {
    clearTimeout(this.switchTimer); // Clear any existing switch timer
    this.switchTimer = setTimeout(() => {
      if (this.isPlaying) { // Only switch players if still playing
        this.switchPlayer();
        this.activePlayer.play();
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
    this.isPlaying = false; // Set isPlaying to false to stop sound
    this.playerOne.stop();
    this.playerTwo.stop();
    clearTimeout(this.switchTimer); // Ensure no player switch occurs after stopping
  }

  componentWillUnmount() {
    this.playerOne.destroy();
    this.playerTwo.destroy();
  }
}

export default SuperImage;
