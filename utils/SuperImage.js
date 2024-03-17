import { Animated } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';

// Class to hold a single image, meant to be part of a stack of
// images, in the 'SuperImage' class.
class SubImage {

  constructor(image) {
    console.log("initializing SubImage");
    this.image = image; // full image object passed from ImagePage
  }

  clone = async function() {
    return(new SubImage(this.image));
  }
}


// This class is meant to hold a whole collection of SubImages, each
// corresponding to some component of an astronomical object. So we
// can choose which one to display.
class SuperImage {
  constructor(image, name="") {

    // Ultimately, the constructor ought to begin with a collection of
    // images and a description of how to portray them. For now, it
    // has a single image input, from which we make a single-image
    // collection. So this part is temporary.
    var subImage = new SubImage(image);
    var imageKey=name;
    if (imageKey == "") imageKey = "1"; 
    this.images = new Array();  // a collection of SubImage objects.
    this.images[imageKey] = subImage;   // Load the first one.
    console.log("initializing superImage", Object.keys(this.images));
    this.currentImageKey = Object.keys(this.images)[0];
    console.log("first image is called:", this.currentImageKey);
    // Previous lines are temporary.

    // A single segment record corresponds to a region of the
    // segmented image. It records a measure of the segment's size and
    // color, and also an index into the tables for the sound and
    // vibrations to be played for that segment. This is a prototype
    // record to be used as a model. It is also the empty record
    // returned when there is no object at that pixel position. 
    this.segmentRecord = {sum: 0, color: 0, haptic: 0, sound: 0};

    // This is a collection of records corresponding to the objects in
    // an image. The zero record is the empty record.
    this.segmentRecords = new Map();
    this.segmentRecords.set(0, Object.assign({}, this.segmentRecord));

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
    /// this.images['segmented'] = null;
    
    // segmentation logic will populate this.segmentedImage with processed data
    this.performSegmentation();
  }

  addImage(image, name="") {
    var imageKey = name;
    if (imageKey == "") imageKey=this.images.length.toString();
    
    this.images[imageKey] = image;
  }

  currentImage() {
    return(this.images[this.currentImageKey]);
  }
  
  performSegmentation() {
    console.log("Performing segmentation on the image");
    // segmentation logic here
  }

  // Retrieve one or more of the segment records corresponding to this
  // screen position. These records will be used to decide what sounds
  // and vibrations to play.
  getRecords(x, y) {
    console.log("getting segmentation records");
  }

  // Depending on where the user interacts with the image (determined
  // by the gesture's x, y coordinates) to trigger different sounds or
  // haptic feedback based on segment
  play(x, y) {
    // need to incorporate logic to check the segmentation data
    console.log("playing at:", x, y);

    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 
          'impactHeavy';
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

