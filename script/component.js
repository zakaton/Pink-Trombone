/*
    TODO
        UI
        phoneme presets
*/

import {} from "./PinkTrombone.js";
import PinkTromboneUI from "./graphics/UserInterface.js";

class PinkTromboneElement extends HTMLElement {
    constructor() {
        super();
        window.customElements.whenDefined("pink-trombone")
            .then(() => {
                const loadEvent = new Event("load");
                this.dispatchEvent(loadEvent);
            });
    }

    static get observedAttributes() {
        return [

        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {

            default:
                break;
        }
    }

    setAudioContext(audioContext = new window.AudioContext()) {
        this.pinkTrombone = audioContext.createPinkTrombone();

        this.loadPromise = this.pinkTrombone.loadPromise
            .then(audioContext => {
                return this.pinkTrombone;
            });
        return this.loadPromise;
    }

    get audioContext() {
        if(this.pinkTrombone)
            return this.pinkTrombone.audioContext;
        else
            throw "Audio Context has not been set";
    }
    set audioContext(audioContext) {
        this.setAudioContext(audioContext);
    }

    connect() {
        if(this.pinkTrombone)
            return this.pinkTrombone.connect(...arguments);
    }
    disconnect() {
        if(this.pinkTrombone)
            return this.pinkTrombone.disconnect(...arguments);
    }

    start() {
        if(this.pinkTrombone)
            return this.pinkTrombone.start();
        else
            throw "Pink Trombone hasn't been set yet";
    }
    stop() {
        if(this.pinkTrombone)
            return this.pinkTrombone.stop();
        else
            throw "Pink Trombone hasn't been set yet";
    }
}

if(document.createElement("pink-trombone").constructor == HTMLElement) {
    window.customElements.define("pink-trombone", PinkTromboneElement);
}

export default PinkTromboneElement;