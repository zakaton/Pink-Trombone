/*
    TODO
        refactor UI (enableUI or whatever)
        setParameter valueRamp (framerate?)
*/

import {} from "./PinkTrombone.js";
import PinkTromboneUI from "./graphics/PinkTromboneUI.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class PinkTromboneElement extends HTMLElement {
    constructor() {
        super();
        this._animationFrameObservers = [];

        window.customElements.whenDefined("pink-trombone")
            .then(() => {
                if(true) { // UI eventListeners
                    this.UI = new PinkTromboneUI();
                    this.appendChild(this.UI.node);

                    // RequestAnimationFrame
                    this.addEventListener("requestAnimationFrame", event => {
                        if(!this._animationFrameObservers.includes(event.target))
                            this._animationFrameObservers.push(event.target);

                        const customEvent = new CustomEvent("didRequestAnimationFrame");
                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });

                    this.addEventListener("resume", event => {
                        this.audioContext.resume();
                        event.target.dispatchEvent(new CustomEvent("didResume"));
                    });
        
                    // Audio Parameters
                    this.addEventListener("setParameter", event => {

                        const parameterName = event.detail.parameterName;
                        const audioParam = parameterName.split('.').reduce((audioParam, propertyName) => audioParam[propertyName], this.parameters);
                        const newValue = Number(event.detail.newValue);

                        // can add more details like the delay and stuff
                        audioParam.value = newValue;

                        const customEvent = new CustomEvent("didSetParameter", {
                            detail : event.detail,
                        });
                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });

                    this.addEventListener("getParameter", event => {
                        const parameterName = event.detail.parameterName;
                        const audioParam = parameterName.split('.').reduce((audioParam, propertyName) => audioParam[propertyName], this.parameters);

                        const value = audioParam.value;

                        const customEvent = new CustomEvent("didGetParameter", {
                            detail : {
                                parameterName : parameterName,
                                value : value,
                            },
                        });
                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });

                    // Constrictions
                    this.addEventListener("newConstriction", event => {
                        const {index, diameter} = event.detail;
                        const constriction = this.newConstriction(index, diameter);

                        const detail = event.detail;
                        detail.constrictionIndex = constriction._index;

                        const customEvent = new CustomEvent("didNewConstriction", {
                            detail : detail,
                        });

                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });
                    this.addEventListener("setConstriction", event => {
                        const constrictionIndex = Number(event.detail.constrictionIndex);
                        const constriction = this.constrictions[constrictionIndex];

                        if(constriction) {
                            const {index, diameter} = event.detail;

                            if(index !== undefined)
                                constriction.index.value = index;

                            if(diameter !== undefined)
                                constriction.diameter.value = diameter;
                            
                            const customEvent = new CustomEvent("didSetConstriction");
                            event.target.dispatchEvent(customEvent);
                        }
                        
                        event.stopPropagation();
                    });
                    this.addEventListener("getConstriction", event => {
                        const constrictionIndex = Number(event.detail.constrictionIndex);
                        const constriction = this.constrictions[constrictionIndex];
                        
                        const customEvent = new CustomEvent("didGetConstriction", {
                            detail : {
                                index : constriction.index.value,
                                diameter : constriction.diameter.value,
                            },
                        });
                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });
                    this.addEventListener("removeConstriction", event => {
                        const constrictionIndex = Number(event.detail.constrictionIndex);
                        const constriction = this.constrictions[constrictionIndex];
                        this.removeConstriction(constriction);

                        const detail = event.detail;
                        
                        const customEvent = new CustomEvent("didRemoveConstriction", {
                            detail : detail,
                        });
                        event.target.dispatchEvent(customEvent);

                        event.stopPropagation();
                    });

                    this.addEventListener("getProcessor", event => {
                        this.getProcessor()
                            .then(processor => {
                                const customEvent = new CustomEvent("didGetProcessor", {
                                    detail : {
                                        processor : processor,
                                    }
                                });
                                event.target.dispatchEvent(customEvent);        
                            });

                        event.stopPropagation();
                    });
                }
            });
        
        const loadEvent = new Event("load");
        this.dispatchEvent(loadEvent);
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
                this.parameters = this.pinkTrombone.parameters;
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
        if(this.pinkTrombone) {
            this.isRunning = true;
            
            if(true) { // is UI
                window.requestAnimationFrame(highResTimeStamp => {
                    this._requestAnimationFrameCallback(highResTimeStamp);
                });
            }

            return this.pinkTrombone.start();
        }
        else
            throw "Pink Trombone hasn't been set yet";
    }
    stop() {
        if(this.pinkTrombone) {
            this.isRunning = false;
            return this.pinkTrombone.stop();
        }
        else
            throw "Pink Trombone hasn't been set yet";
    }

    _requestAnimationFrameCallback(highResTimeStamp) {
        if(this.isRunning) {
            this._animationFrameObservers.forEach(element => {
                const customEvent = new CustomEvent("animationFrame", {
                    detail : {
                        highResTimeStamp : highResTimeStamp,
                    }
                });
                element.dispatchEvent(customEvent);
            });
            window.requestAnimationFrame(_highResTimeStamp => this._requestAnimationFrameCallback.call(this, _highResTimeStamp));
        }
    }

    get constrictions() {
        return this.pinkTrombone.constrictions;
    }
    newConstriction() {
        return this.pinkTrombone.newConstriction(...arguments);
    }
    removeConstriction(constriction) {
        return this.pinkTrombone.removeConstriction(constriction);
    }

    getProcessor() {
        return this.pinkTrombone.getProcessor();
    }
}

if(document.createElement("pink-trombone").constructor == HTMLElement) {
    window.customElements.define("pink-trombone", PinkTromboneElement);
}

export default PinkTromboneElement;