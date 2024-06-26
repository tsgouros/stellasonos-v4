# stellasonos-v4

<a name="readme-top"></a>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#React Native Environment">React Native Environment</a></li>
        <li><a href="#ios">ios</a></li>
        <li><a href="#Android">Android</a></li>
      </ul>
    </li>
    <li><a href="#Features">Code</a></li>
    <li><a href="#Todos">Todos</a></li>
    <li><a href="#Todos">Notes from Yumeng</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About

Sonification of astronomical data version 4. Visualization mobile application for looking at distant stellar objects with sounds and haptics for blind and low vision users. 
Built with [React Native](https://reactnative.dev/). 

<!-- GETTING STARTED -->
## Getting Started

### React Native Environment
The following instructions have been adapted from [React Native’s documentation](https://reactnative.dev/docs/environment-setup):

1. Install the following two packages using Homebrew: 
  ```sh
  brew install node
  brew install watchman
  ```
2. Clone the repo
   ```sh
   git clone https://github.com/tsgouros/stellasonos-v4.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```

### iOS
Please use the latest version of Xcode. You can download and update Xcode from the app store. 

To instal and run iOS simulator: 
1. Open Xcode > Settings... (or Preferences...)
2. Select the Platforms (or Components) tab.
3. Select a simulator with the corresponding version of iOS you wish to use.
4. cd into the ios directory of your project and run 
   ```js
   pod install 
   ```
5. Start the server in the main project directory to run on ios simulator
   ```js
   npm run ios
   ``` 

To run on iPhone or iPad, [follow these steps](https://reactnative.dev/docs/running-on-device?platform=ios). For this project, make sure you are running the .xcodeworkspace file. 

### Android 
To install and run Android simulator: 
1. Ensure that Homebrew is installed:
  ```sh
    brew -v
  ```
2. Install the Azul Zulu OpenJDK distribution using Homebrew: 
  ```sh
    brew tap homebrew/cask-versions
    brew install --cask zulu11
  ```
3. Download and install [Android Studio](https://developer.android.com/studio)
4. While on Android Studio installation wizard, make sure the boxes next to the following items are checked: 
    - [x] Android SDK
    - [x] Android SDK Platform
    - [x] Android Virtual Device
5. Click "Next" to install these components.
6. Once setup has finalized and you are presented with the Welcome screen, proceed to the next step.
7. Android Studio installs the latest Android SDK by default. Building a React Native app with native code, however, requires the Android 13 (Tiramisu) SDK in particular. Additional Android SDKs can be installed through the SDK Manager in Android Studio. To do so, open Android Studio, click on the "More Actions" button and select "SDK Manager".
8. Select the "SDK Platforms" tab from within the SDK Manager and check the box next to "Show Package Details" in the bottom right corner. Look for and expand the Android 13 (Tiramisu) entry and make sure the following items are checked:
    - [x] `Android SDK Platform 33`
    - [x] `Intel x86 Atom_64 System Image` or `Google APIs Intel x86 Atom System Image` or `Google APIs ARM 64 v8a System Image` (for Apple M1 Silicon)
9. Select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the "Android SDK Build-Tools" entry, then make sure that 33.0.0 is selected.
10. Click "Apply" to download and install the Android SDK and related build tools.
11. Add the following lines to your `~/.zprofile` or `~/.zshrc` (if you are using bash, then `~/.bash_profile or ~/.bashrc`) config file:
  ```sh
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
12. Load the config into your current shell:
  ```sh
  source ~/.zprofile
  ```
  or for bash:
  ```sh
  source ~/.bash_profile
  ```
13. Verify that `ANDROID_HOME` has been set:
  ```sh
    echo $ANDROID_HOME
  ```
  and the appropriate directories have been added to your path:
  ```sh
    echo $PATH
  ```
14. From the Android Studio Welcome screen, select the “More Actions” button > “Virtual Device Manager”.
15. Pick any phone from the list (Pixel 6 is the latest at time of writing) and click "Next". 
16. Select the Tiramisu API Level 33 image. 
17. Click "Next" then "Finish" to create your AVD.
18. Start the server in the main project directory to run the android emulator
   ```js
   npm run android 
   ```

To run on Android phone or tablet, [follow these steps](https://reactnative.dev/docs/running-on-device?platform=android)

<!-- Features -->
## Code
- `images.json`: list of all images with their title, description, url, id, and layers

### Pages
- `Intro.js`: intro screen to take user to home screen
- `Home.js`: displays image selection
- `imagePage.js`: interactive image display of the image selected from home page

### Utils 
- `ironicConfig.json`: configurable settings for sound, volume, haptic feedback, and player switching settings for different segments of images
- `SuperImage.js`: manages a collection of sub-images, each representing different components of an astronomical object, and handles image segmentation, sound playback, and haptic feedback based on user interactions with different segments of the image.
- `styles.js`: styling used accross the pages

<!-- Todos -->
## Todos
- **Screen Reader Compatibility**: Refine code and gesture handling for better compatibility with screen readers ([VoiceOver](https://support.apple.com/guide/iphone/use-voiceover-gestures-iph3e2e2281/ios) on iOS and [Talkback](https://accessibleandroid.com/talkback/) on Android). Include direct testing to ensure all components are properly announced.
- **Enhance Image Segmentation**: Improve the accuracy of image segmentation, particularly by aligning x and y coordinates more accurately and developing a more sophisticated approach.
- **Seamless Audio Playback**: Ensure that the two sound players operate without any gaps to provide a continuous audio experience.
- **Android Testing**: Expand testing to Android devices, as the code has only been tested on iOS platform so far.
- **UI Improvements**: Enhance the user interface to improve visual appeal and usability.

## Notes from Yumeng
Be mindful that When screenreaders are enabled, the default gesture behaviors are altered to accommodate ccessibility needs. Standard swipe gestures (like one-finger swipes) that are normally used for navigation are automatically replaced with alternative gestures (like three-finger swipes) to avoid conflicts with the single-finger gestures used for selecting and interacting with elements on the screen. Screen reader gestures on iOS and android are similar but have differences. 

For `Home.js`:
- Please don't design with swipe cards like in V3! There appears to be limited research focused directly on how blind and low-vision users interact with swipe cards, such as those used in apps like Tinder + wihtout sounds or haptics, these users will get confused where they have swiped to! Dating apps have also historiclly been known for being inaccessible.
- Take inspiration from Apple Photos. Use swipe feature to move between photos, and ensure users can navigate through thumbnails. Provide auditory feedback to inform users of their current position within the sequence of images.
  
For `imagePage.js`:
- When users drag their finger over a segmented image to trigger specific sounds or haptics, the interaction somewhat reminds me of drawing apps like Procreate. Procreate has explicitly stated that VoiceOver is [not compatible with its drawing functions](https://help.procreate.com/procreate/handbook/interface-gestures/accessibility).
- I haven't discovered any screen reader gesture alternatives that correlate with single-finger dragging, and it's unclear if this functionality is currently supported, as indicated by Procreate.
- It's possible for users to set up a shortcut to toggle VoiceOver on and off, which can help avoid the need to navigate back to the global device settings.

Some Other Resources:
- https://reactnative.dev/docs/accessibility
- https://reactnative.dev/docs/accessibilityinfo
- https://gestalt.pinterest.systems/foundations/accessibility

<p align="right"><a href="#readme-top">back to top</a></p>
