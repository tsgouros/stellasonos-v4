import { Animated, Dimensions } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Player } from '@react-native-community/audio-toolkit';
import ironicConfig from './ironicConfig.json'; 

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
    this.description = complexImage.description;
    this.id = complexImage.id;
    this.layers = new Array();

    for (var i = 0; i < complexImage.layers.length; i++) {
      this.layers[complexImage.layers[i].id] = 
        new SubImage(complexImage.layers[i].src, complexImage.layers[i].layer);
    }

    // Start at the first image key.
    this.currentImageKey = Object.keys(this.layers)[0];
    
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
    this.segmentRecord = { sum: 0, color: 0, haptic: 0, sound: 0 };
    
    // This is for processing the floodFill used in segmentation.
    this.visited = null;

    // This is a collection of records corresponding to the objects in
    // an image. The zero record is the empty record.
    this.segmentRecords = new Map();
    this.segmentRecords.set(0, {...this.segmentRecord});

    this.pan = new Animated.ValueXY();
    this.canTriggerVibration = true;
    this.initialVolume = ironicConfig.initialVolume;
    this.players = {};
    this.isPlaying = false;
    this.switchInterval = 5000; // Time between automatic player switches

    // load sounds for each segment from ironicConfig
    const sounds = ironicConfig.colors[this.description];
    for (let key in sounds) {
      this.players[key] = new Player(sounds[key].sound, { autoDestroy: false }).prepare((err) => {
        if (!err) {
          this.players[key].volume = this.initialVolume;
        }
      });
    }

    this.activeSegment = "0";  // default seg
    this.activePlayer = this.players[this.activeSegment];
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


  // Given a bit position [i,j], this function does a flood fill on
  // all the connected area, setting all those pixels to the input
  // 'value' argument. The image being operated on is this.segmentedData.
  floodFill(i, j, value) {
    if ((i < 0) || (i >= this.win.imgWidth) || 
        (j < 0) || (j >= this.win.imgHeight)) return(0);

    var fillStack = [];

    fillStack.push([i, j]);
    var output = 0;

    while(fillStack.length > 0) {
      // Check the top of the stack.
      var [icol, jrow] = fillStack.pop();
      var index = jrow * this.win.imgWidth + icol;

      // Check to see if we need to bother with this cell. Either the cell 
      // is out of bounds, or was never our business, or it's already been 
      // visited.
      if ((icol < 0) || 
          (icol >= this.win.imgWidth) || 
          (jrow < 0) || 
          (jrow >= this.win.imgHeight) ||
          (this.segmentData[index] < 0) || 
          (this.visited[index] == true) ||
          (this.segmentData[index] == value)) continue;

      // Apparently we need to. Record the cell value in the image...
      this.segmentData[index] = value;

      // ... record that we have visited this cell...
      this.visited[index] = true;

      // ... increment the output counter, and ...
      output += 1;

      // ... push the neighboring cells onto the stack.
      if (jrow > 0) fillStack.push([icol, jrow-1]);
      if (jrow <= this.win.imgHeight) fillStack.push([icol, jrow+1]);
      if (icol > 0) fillStack.push([icol-1, jrow]);
      if (icol <= this.win.imgWidth) fillStack.push([icol+1, jrow]);
    }

    return(output);
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


        this.visited = new Uint8Array(this.segmentData.length).fill(false);

        var nextObject = 0;
        var index = 0;
        for (let i = 0; i < this.win.imgWidth; i++) {
          for (let j = 0; j < this.win.imgHeight; j++) {
        
            index = j * this.win.imgWidth + i;

            if (this.segmentData[index] == 0) {
              // We have an object we probably we haven't seen it before...
          
              // ... double check about not seeing it before.
              if (this.visited[index] == false) {

                console.log("found one", i, j, nextObject);

                nextObject += 1;
                var objectID = nextObject;

                // Record some results in the segmentData record.
                if (!this.segmentRecords.has(objectID)) {
                  this.segmentRecords.set(objectID,
                                          {sum: this.segmentRecord.sum,
                                           color: this.segmentRecord.color,
                                           color: this.segmentRecord.haptic,
                                           color: this.segmentRecord.sound });
                }

                // Fill the object, return
                this.segmentRecords.get(objectID).sum = 
                  this.floodFill(i, j, objectID);

                console.log("segmentation record:", objectID, 
                            this.segmentRecords.get(objectID).sum);
                // As of here, we have a rough estimate of the size of an
                // object, so this is a place where we can put logic to
                // assign different notes or haptic values based on size.

              }
            }
          }
        }

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
    this.isPlaying = true;
    let pos = this.getPos(x, y);
    let index = pos.y * this.win.imgWidth + pos.x;
    
    console.log("playing at:", pos.x, pos.y, this.segmentData[index]);
  
    if (!this.segmentData || index >= this.segmentData.length || index < 0) {
      console.error("ERROR Segment data is not available or index is out of bounds.");
      return;
    }
  
    let segmentValue = this.segmentData[index];
    segmentValue = segmentValue ? segmentValue.toString() : 'undefined';
  
    if (!(segmentValue in this.players)) {
      console.error(`ERROR No player associated with segment value ${segmentValue}`);
      return;
    }
  
    if (this.activeSegment !== segmentValue) {
      if (this.activePlayer && this.activePlayer.isPlaying) {
        this.activePlayer.stop();  // Stop the currently playing sound
      }
      this.activePlayer = this.players[segmentValue];
      this.activeSegment = segmentValue;
    }
  
    if (this.activePlayer && !this.activePlayer.isPlaying) {
      this.activePlayer.play();
      this.scheduleSwitch();
    }
  
    const style = Math.abs(x) < 100 && Math.abs(y) < 100 ? 'impactLight' : 'impactHeavy';
    if (this.canTriggerVibration) {
      ReactNativeHapticFeedback.trigger(style, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      this.canTriggerVibration = false;
      setTimeout(() => this.canTriggerVibration = true, 1000);
    }
  }
  
  switchPlayer() {
    if (this.isPlaying && this.activePlayer && this.activePlayer.isPlaying) {
      this.activePlayer.stop();
      this.activePlayer.play();  // Immediately play the same player to simulate continuous sound
    }
  }
  
  scheduleSwitch() {
    clearTimeout(this.switchTimer);
    this.switchTimer = setTimeout(() => {
      this.switchPlayer();
      if (this.isPlaying) {
        this.scheduleSwitch();
      }
    }, this.switchInterval);
  }
  
  stopSound() {
    this.isPlaying = false;
    if (this.activePlayer) {
      this.activePlayer.stop();
    }
    clearTimeout(this.switchTimer);
  }

  componentWillUnmount() {
    // Clean up players
    for (let key in this.players) {
      this.players[key].destroy();
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
    Object.values(this.players).forEach(player => {
      if (player) {
        player.stop();
        player.destroy();
      }
    });
  }
  
}

export default SuperImage;