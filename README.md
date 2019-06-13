__STILL UNDER CONSTRUCTION - DON'T USE IT YET__

<a href="https://twitter.com/ConcreteSciFi/status/1138555909133594624" target="_blank">![Fabien](images/pinkTrombone.gif)</a>

# 🗣️ Pink Trombone - Bare-handed Speech Synthesis
_A programmable version of [Neil Thapen's](http://venuspatrol.nfshost.com/) famous and wonderful [Pink Trombone](https://dood.al/pinktrombone/)_

## 📚 Table of Contents
[📦 Setting Up](#-setting-up)

[👄 Producing Sound](#-producing-sound)

[👀 Enabling and Disabling the UI](#-enabling-and-disabling-the-ui)

[🎺 Setting the Volume, Pitch & Voiceness](#-setting-the-volume,-pitch-&-voiceness)

[👅 Articulating the Tongue and Vocal Tract](#-articulating-the-tongue-and-vocal-tract)

[🏆 Developer Showcase](#-developer-showcase)

[🙏 Developer Wishlist](#-developer-wishlist)

## 📦 Setting Up
1. Save a local copy of [`pink-trombone.min.js`](https://raw.githubusercontent.com/zakaton/Pink-Trombone/master/pink-trombone.min.js) and [`pink-trombone-worklet-processor.min.js`](https://raw.githubusercontent.com/zakaton/Pink-Trombone/master/pink-trombone-worklet-processor.min.js)

2. In your HTML `<head></head>` element, insert the file in a script element:
```html
<script src="pink-trombone.min.js"></script>
```

3. In your HTML `<body></body>` element, insert the following custom element:
```html
<pink-trombone></pink-trombone>
```

4. Add a `load` eventListener to the `<pink-trombone></pink-trombone>` element:
```javascript
document.querySelector("pink-trombone").addEventListener("load", myCallback);
```

5. In the `"load"` callback, assign an [Audio Context](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) using `.setAudioContext(myAudioContext)` (if none is specified, an Audio Context instance is created for you):
```javascript
function myCallback(event) {
  event.target.setAudioContext(myAudioContext)
}
```
This method returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) once the [AudioWorkletProcessor](https://github.com/zakaton/Pink-Trombone/blob/master/script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js) module is loaded.

6. In the [promise resolution](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then), a [Pink Trombone audio node](https://github.com/zakaton/Pink-Trombone/blob/master/script/audio/nodes/pinkTrombone/AudioNode.js) is created, which you can connect to other audio nodes from the scope of the `<pink-trombone></pink-trombone>` element:
```javascript
function myCallback(event) {
  event.target.setAudioContext(myAudioContext)
    .then(() => {
      const audioContext = document.querySelector("pink-trombone")
      document.querySelector("pink-trombone").connect(audioContext.destination);
    });
}
```

## 👄 Producing Sound
😃 To start generating sound, run the `.start()` method:
```javascript
      document.querySelector("pink-trombone").start();
```

🤐 To stop generating sound, run the `.stop()` method:
```javascript
      document.querySelector("pink-trombone").stop();
```

## 👀 Enabling and Disabling the UI
🙂 To show the interactive visualization:
```javascript
      document.querySelector("pink-trombone").enableUI();
```

😊 To hide the interactive visualization:
```javascript
document.querySelector("pink-trombone").disableUI();
```

## 🎺 Setting the Volume, Pitch & Voiceness

🎚️ To change the volume:
```javascript
document.querySelector("pink-trombone").intensity.value = newIntensityValue;
```

🎵 To change the pitch frequency, set the `frequency` [audio parameter](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam):
```javascript
document.querySelector("pink-trombone").frequency.value = newFrequencyValue;
```


👄 To change the [voiceness](https://en.wikipedia.org/wiki/Voice_(phonetics)):
```javascript
document.querySelector("pink-trombone");
```

## 👅 Articulating the Tongue and Vocal Tract
To set the Tongue Articulation, set:
```javascript
document.querySelector("pink-trombone").tongue.index.value = newIndexValue;
document.querySelector("pink-trombone").tongue.diameter.value = newDiameterValue;
```

To add a vocal tract constriction:
```javascript
var myConstriction = document.querySelector("pink-trombone").newConstriction(indexValue, diameterValue);
```

To set a vocal tract constriction:
```javascript
myConstriction.index.value = newIndexValue;
myConstriction.diameter.value = newDiameterValue;
```

To remove a vocal tract constriction:
```javascript
document.querySelector("pink-trombone").removeConstriction(myConstriction);
```

## 🏆 Developer Showcase
*Send us an email at zack@ukaton.com if you have a cool application made with our api!*

## 🙏 Developer Wishlist
_Our time is limited, so we'd greatly appreciate it if you guys could implement some of these ideas:_
