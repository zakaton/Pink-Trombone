/*
    TODO
        *
*/

import {} from "./PinkTrombone.js";
import PinkTromboneUI from "./graphics/PinkTromboneUI.js";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

class PinkTromboneElement extends HTMLElement {
  constructor() {
    super();

    this._animationFrameObservers = [];

    window.customElements.whenDefined("pink-trombone").then(() => {
      // RequestAnimationFrame
      this.addEventListener("requestAnimationFrame", (event) => {
        if (!this._animationFrameObservers.includes(event.target)) this._animationFrameObservers.push(event.target);

        const customEvent = new CustomEvent("didRequestAnimationFrame");
        event.target.dispatchEvent(customEvent);

        event.stopPropagation();
      });

      this.addEventListener("resume", (event) => {
        this.audioContext.resume();
        this.pinkTrombone.start();
        event.target.dispatchEvent(new CustomEvent("didResume"));
      });

      // Audio Parameters
      this.addEventListener("setParameter", (event) => {
        const parameterName = event.detail.parameterName;
        const audioParam = parameterName
          .split(".")
          .reduce((audioParam, propertyName) => audioParam[propertyName], this.parameters);
        const newValue = Number(event.detail.newValue);

        switch (event.detail.type) {
          case "linear":
            audioParam.linearRampToValueAtTime(newValue, this.audioContext.currentTime + event.detail.timeOffset);
            break;
          default:
            audioParam.value = newValue;
        }

        event.target.dispatchEvent(
          new CustomEvent("didSetParameter", {
            detail: event.detail,
          })
        );

        event.stopPropagation();
      });

      this.addEventListener("getParameter", (event) => {
        const parameterName = event.detail.parameterName;
        const audioParam = parameterName
          .split(".")
          .reduce((audioParam, propertyName) => audioParam[propertyName], this.parameters);

        const value = audioParam.value;

        const detail = event.detail;
        detail.value = value;

        event.target.dispatchEvent(
          new CustomEvent("didGetParameter", {
            detail: detail,
          })
        );

        event.stopPropagation();
      });

      // Constrictions
      this.addEventListener("newConstriction", (event) => {
        const { index, diameter } = event.detail;
        const constriction = this.newConstriction(index, diameter);

        const detail = event.detail;
        detail.constrictionIndex = constriction._index;
        event.target.dispatchEvent(
          new CustomEvent("didNewConstriction", {
            detail: detail,
          })
        );

        event.stopPropagation();
      });
      this.addEventListener("setConstriction", (event) => {
        const constrictionIndex = Number(event.detail.constrictionIndex);
        const constriction = this.constrictions[constrictionIndex];

        if (constriction) {
          const { index, diameter } = event.detail;

          const indexValue = index || constriction.index.value;
          const diameterValue = diameter || constriction.diameter.value;

          switch (event.detail.type) {
            case "linear":
              constriction.index.linearRampToValueAtTime(indexValue, event.detail.endTime);
              constriction.diameter.linearRampToValueAtTime(diameterValue, event.detail.endTime);
              break;
            default:
              constriction.index.value = indexValue;
              constriction.diameter.value = diameterValue;
          }

          event.target.dispatchEvent(new CustomEvent("didSetConstriction"));
        }

        event.stopPropagation();
      });
      this.addEventListener("getConstriction", (event) => {
        const constrictionIndex = Number(event.detail.constrictionIndex);
        const constriction = this.constrictions[constrictionIndex];

        event.target.dispatchEvent(
          new CustomEvent("didGetConstriction", {
            detail: {
              index: constriction.index.value,
              diameter: constriction.diameter.value,
            },
          })
        );

        event.stopPropagation();
      });
      this.addEventListener("removeConstriction", (event) => {
        const constrictionIndex = Number(event.detail.constrictionIndex);
        const constriction = this.constrictions[constrictionIndex];
        this.removeConstriction(constriction);

        const detail = event.detail;

        event.target.dispatchEvent(
          new CustomEvent("didRemoveConstriction", {
            detail: detail,
          })
        );

        event.stopPropagation();
      });

      this.addEventListener("getProcessor", (event) => {
        this.getProcessor().then((processor) => {
          event.target.dispatchEvent(
            new CustomEvent("didGetProcessor", {
              detail: {
                processor: processor,
              },
            })
          );
        });

        event.stopPropagation();
      });
    });

    if (this.getAttribute("UI") !== null) this.enableUI();

    const loadEvent = new Event("load");
    this.dispatchEvent(loadEvent);
  }

  enableUI() {
    if (this.UI == undefined) {
      this.UI = new PinkTromboneUI();
      this.appendChild(this.UI.node);
    }

    this.UI.show();
  }
  disableUI() {
    if (this.UI !== undefined) {
      this.UI.hide();
      this.stopUI();
    }
  }

  startUI() {
    if (this.UI !== undefined) {
      this._isRunning = true;
      window.requestAnimationFrame((highResTimeStamp) => {
        this._requestAnimationFrameCallback(highResTimeStamp);
      });
    }
  }
  stopUI() {
    this._isRunning = false;
  }

  // getAttribute getter?
  static get observedAttributes() {
    return ["UI"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "UI":
        if (newValue !== null) this.enableUI();
        else this.disableUI();
        break;
      default:
        break;
    }
  }

  setAudioContext(audioContext = new window.AudioContext()) {
    this.pinkTrombone = audioContext.createPinkTrombone();

    this.loadPromise = this.pinkTrombone.loadPromise.then((audioContext) => {
      this.parameters = this.pinkTrombone.parameters;

      for (let parameterName in this.pinkTrombone.parameters)
        this[parameterName] = this.pinkTrombone.parameters[parameterName];

      return this.pinkTrombone;
    });
    return this.loadPromise;
  }

  get audioContext() {
    if (this.pinkTrombone) return this.pinkTrombone.audioContext;
    else throw "Audio Context has not been set";
  }
  set audioContext(audioContext) {
    this.setAudioContext(audioContext);
  }

  connect() {
    if (this.pinkTrombone) return this.pinkTrombone.connect(...arguments);
  }
  disconnect() {
    if (this.pinkTrombone) return this.pinkTrombone.disconnect(...arguments);
  }

  start() {
    if (this.pinkTrombone) {
      this.pinkTrombone.start();
      this.startUI();
    } else throw "Pink Trombone hasn't been set yet";
  }
  stop() {
    if (this.pinkTrombone) {
      this.pinkTrombone.stop();
      this.stopUI();
    } else throw "Pink Trombone hasn't been set yet";
  }

  _requestAnimationFrameCallback(highResTimeStamp) {
    if (this._isRunning) {
      this._animationFrameObservers.forEach((element) => {
        const customEvent = new CustomEvent("animationFrame", {
          detail: {
            highResTimeStamp: highResTimeStamp,
          },
        });
        element.dispatchEvent(customEvent);
      });
      window.requestAnimationFrame((_highResTimeStamp) =>
        this._requestAnimationFrameCallback.call(this, _highResTimeStamp)
      );
    }
  }

  // CONSTRICTIONS
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

if (document.createElement("pink-trombone").constructor == HTMLElement) {
  window.customElements.define("pink-trombone", PinkTromboneElement);
}

export default PinkTromboneElement;
