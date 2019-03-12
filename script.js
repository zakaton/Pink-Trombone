import PinkTrombone from "/PinkTrombone.js";

const audioContext = new AudioContext();

PinkTrombone.Load(audioContext)
    .then(() => {
        const pinkTrombone = new PinkTrombone(audioContext);
            pinkTrombone.connect(audioContext.destination);
            pinkTrombone.start();

            window.pinkTrombone = pinkTrombone;
            window.audioContext = audioContext;
    })