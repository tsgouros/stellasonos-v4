import { Animated, Dimensions } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';

import * as _Jimp from 'jimp';
const Jimp = (typeof self !== 'undefined') ? (self.Jimp || _Jimp) : _Jimp;

// Class to hold a single image, meant to be part of a stack of
// images, in the 'SuperImage' class.
class SubImage {

  constructor(src, description) {
    console.log("initializing SubImage", src, description);
    this.src = src;
    this.description = description;
  }

  clone = async function() {
    return(new SubImage(this.src, this.description));
  }
}


// This class is meant to hold a whole collection of SubImages, each
// corresponding to some component of an astronomical object. So we
// can choose which one to display. The 'image' object it accepts is 
// an entry in the images.json file, and it contains a master URL, and
// also a collection of subImage URLs.
class SuperImage {
  constructor(complexImage, name="") {

    console.log("initializing SuperImage", Object.keys(complexImage));
    this.masterSrc = complexImage.src;
    this.URL = complexImage.url;
    this.description = complexImage.description
    this.id = complexImage.id;
    this.layers = new Array();

    for (var i = 0; i < complexImage.layers.length; i++) {
      this.layers[complexImage.layers[i].id] = 
        new SubImage(complexImage.layers[i].src, complexImage.layers[i].layer);
    }

    // Start at the first image key.
    this.currentImageKey = Object.keys(this.layers)[0];
    console.log("complexImage starting with:", this.currentImageKey);
    
    // This will be our segmentation record. Ultimately, the segmented
    // image should just be another SubImage in the layers array, but
    // later.
    this.segmentData = null;

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
    /// this.layers['segmented'] = null;
    
  }

  addImage(image, name="") {
    var imageKey = name;
    if (imageKey == "") imageKey=this.layers.length.toString();
    
    this.layers[imageKey] = image;
  }

  currentImage() {
    return(this.layers[this.currentImageKey]);
  }

  // Accept window coordinates, return image coordinates.
  getPos(x, y) { 
    var yr = (this.win.totalHeight - this.win.winHeight)/2;
    return { x: Math.round((x / this.win.winWidth) * this.win.imgWidth),
             y: Math.round(((y - yr)/ this.win.winHeight) * this.win.imgHeight),
           };
    }
  
  async performSegmentation(imageData) {

    // What are the actual dimensions of the displayed image, in pixels.
    this.win = {
      winWidth: Dimensions.get("window").width,
      winHeight: (imageData.height / imageData.width) * 
        Dimensions.get("window").width,
      totalHeight: Dimensions.get("window").height,
      imgWidth: imageData.width,
      imgHeight: imageData.height,
    }

    this.segmentData = null;

    console.log("Window thing:", this.win);

    await new Jimp(
      imageData.width, imageData.height, 
      (error, jData) => { 
        console.log("JIMP success ***!", error, Object.keys(imageData),Object.keys(jData.bitmap), jData.bitmap.width, jData.bitmap.height, typeof jData.bitmap.data[1], imageData.colorType, imageData.sRGB, imageData.data.length);
        if (error) stop(error);

        // Build a convolution array.
        var kernelArray = Array.from(Array(5), () => new Array(5));
        kernelArray[0] = [1/25, 1/25, 1/25, 1/25, 1/25];
        kernelArray[1] = [1/25, 1/25, 1/25, 1/25, 1/25];
        kernelArray[2] = [1/25, 1/25, 1/25, 1/25, 1/25];
        kernelArray[3] = [1/25, 1/25, 1/25, 1/25, 1/25];
        kernelArray[4] = [1/25, 1/25, 1/25, 1/25, 1/25];
        
        // res is just for debugging, remove it when you want.
        var res

        // 'result' is for transferring the output data to this.segmentData. 
        // 'this' refers to something else inside the functions below.
        var result = new Int16Array(jData.bitmap.width * jData.bitmap.height);
        jData.scan(
          0, 0, jData.bitmap.width, jData.bitmap.height, 
          function (x, y, idx) {
            // x, y is the position of this pixel on the image idx is
            // the start position of this rgba tuple in the bitmap.
            this.bitmap.data[idx + 0] = imageData.data[idx + 0]; // red
            this.bitmap.data[idx + 1] = imageData.data[idx + 1]; // green 
            this.bitmap.data[idx + 2] = imageData.data[idx + 2]; // blue
            this.bitmap.data[idx + 3] = imageData.data[idx + 3]; // alpha

            if (x == jData.bitmap.width - 1 && y == jData.bitmap.height - 1) {
              // image scan finished, do first segmentation step.
              res = jData
                .clone()
                .resize(500, 500)
                .blur(5)
                .convolute(kernelArray)
                .resize(imageData.width, imageData.height)
                .greyscale()
              // Apply a threshold and inversion, while copying to output.
                .scan(0, 0, jData.bitmap.width, jData.bitmap.height, 
                      function(x, y, idx) {
                        result[y * jData.bitmap.width + x] =
                          this.bitmap.data[idx] > 50 ? 0 : -1;
                      });
            }

          });

        this.segmentData = result;

        // console.log(">>>>>>>>>", 
        //             imageData.data[6080],
        //             imageData.data[6081],
        //             imageData.data[6082],
        //             imageData.data[6083],
        //             res.bitmap.data[6080],
        //             res.bitmap.data[6081],
        //             res.bitmap.data[6082],
        //             res.bitmap.data[6083],
        //             this.segmentData[1520]);
        // console.log(">>>>>>>>>", 
        //             imageData.data[1500],
        //             imageData.data[1501],
        //             imageData.data[1502],
        //             imageData.data[1503],
        //             res.bitmap.data[1500],
        //             res.bitmap.data[1501],
        //             res.bitmap.data[1502],
        //             res.bitmap.data[1503],
        //             this.segmentData[375]);

        // Other segmentation work goes here.
        console.log("Done with segmentation, ready to rock.");
      });

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

    // Check segmentation data
    let pos = this.getPos(x, y)
    console.log("playing at:", pos.x, pos.y,
                this.segmentData[ pos.y * this.win.imgWidth + pos.x ]);

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
this.layers['segmented'] = await this.layers[imageKey].clone();
this.layers['segmented'].image = this.layers[imageKey].image.grey();

convolution
this.img = this.img
  .resize({width: 550, height: 550})
  .convolution(kernelArray)
  .erode({number: 1}).dilate({number: 1})
  .resize({width: this.layers[imageKey].image.width, height: this.layers[imageKey].image.height})
  .mask({threshold: 0.25, invert: true});

flood fill 
this.segmentRecords.get(objectID).sum = this.floodFill(i, j, objectID);

* might be necessary to look into react-native-image-filter-kit or custom native modules?
*/

