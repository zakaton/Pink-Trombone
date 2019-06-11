/*
    TODO        
        throttle value setter
        set actual frequency range
*/

Math.clamp = function(value, min = 0, max = 1) {
    return value < min?
        min :
        value < max?
            value :
            max;
}

class GlottisUI {
    constructor() {
        this._frequency = {
            min : 20,
            max : 1000,
            get range() {
                return (this.max - this.min);
            },

            interpolate(interpolation) {
                return this.min + (this.range * interpolation);
            },
        };
        
        this._isActive = false;
        this._alwaysVoice = true;

        this._container = document.createElement("div");
            this._container.style.border = "solid red 1px";
            this._container.style.backgroundColor = "pink";
            this._container.style.borderRadius = "20px";
        
        this._slider = document.createElement("div");
            this._slider.style.position = "relative";
            this._slider.style.flex = 0;
            this._slider.style.width = "20px";
            this._slider.style.height = "20px";
            this._slider.style.borderRadius = "20px";
            this._slider.style.border = "solid red 5px";
            this._slider.style.top = "50%";
            this._slider.style.left = "50%";
        this._container.appendChild(this._slider);

        // EventListeners for setting the Parameters
        this._container.addEventListener("mousedown", event => {
            this._isActive = true;
            this._eventCallback(event);

            if(!this._alwaysVoice)
                this._container.dispatchEvent(new CustomEvent("setParameter", {
                    bubbles : true,
                    detail : {
                        parameterName : "intensity",
                        newValue : 1,
                        // type : "linear"
                        // time : ?
                    },
                }));
        });
        this._container.addEventListener("mousemove", event => {
            this._eventCallback(event);
        });
        this._container.addEventListener("mouseup", event => {
            this._isActive = false;

            if(this._alwaysVoice == false)
                this._container.dispatchEvent(new CustomEvent("setParameter", {
                    bubbles : true,
                    detail : {
                        parameterName : "intensity",
                        newValue : 0,
                        // type : "linear"
                        // time : ?
                    },
                }));
        });

        this._container.addEventListener("touchstart", event => {
            event.preventDefault();

            if(!this._isActive) {
                this._isActive = true;
                const touch = event.changedTouches[0];
                this._touchIdentifier = touch.identifier;
                this._eventCallback(touch);

                if(!this._alwaysVoice)
                    this._container.dispatchEvent(new CustomEvent("setParameter", {
                        bubbles : true,
                        detail : {
                            parameterName : "intensity",
                            newValue : 1,
                            // type : "linear"
                            // time : ?
                        },
                    }));
            }
        });
        this._container.addEventListener("touchmove", event => {
            event.preventDefault();

            const touch = Array.from(event.changedTouches).find(touch => touch.identifier == this._touchIdentifier);
            
            if(touch !== undefined)
                this._eventCallback(touch);
        });
        this._container.addEventListener("touchend", event => {
            event.preventDefault();

            if(this._isActive &&Array.from(event.changedTouches).some(touch => touch.identifier == this._touchIdentifier)) {
                this._isActive = false;
                this._touchIdentifier = -1;
            }

            if(!this._alwaysVoice)
                this._container.dispatchEvent(new CustomEvent("setParameter", {
                    bubbles : true,
                    detail : {
                        parameterName : "intensity",
                        newValue : 0,
                        // type : "linear"
                        // time : ?
                    },
                }));
        });

        this._container.addEventListener("message", event => {
            if(event.detail.type == "toggleButton") {
                if(event.detail.parameterName == "voice") {
                    this._alwaysVoice = event.detail.newValue == "true";
                }
            }
        });


        // Observe AnimationFrame
        const mutationObserver = new MutationObserver((mutationsList, observer) => {
            if(document.contains(this._container)) {

                const customEvent = new CustomEvent("requestAnimationFrame", {
                    bubbles : true,
                });
                this._container.dispatchEvent(customEvent);

                observer.disconnect();
            }
        });
        mutationObserver.observe(document.body, {
            subtree : true,
            childList : true,
        });


        // AnimationFrame EventListener
        this._container.addEventListener("animationFrame", event => {
            ["frequency", "tenseness"].forEach(parameterName => {
                const customEvent = new CustomEvent("getParameter", {
                    bubbles : true,
                    detail : {
                        parameterName : parameterName,
                        render : true,
                    },
                });
                event.target.dispatchEvent(customEvent);
            });
        });


        // EventListeners for Getting Parameters
        this._container.addEventListener("didGetParameter", event => {
            if(event.detail.render == true) {
                const parameterName = event.detail.parameterName;
                const value = event.detail.value;

                if(["frequency", "tenseness"].includes(parameterName)) {
                    var interpolation;

                    if(parameterName == "frequency") {
                        interpolation = Math.clamp(((value-this._frequency.min)/this._frequency.range));
                        this._slider.style.left = interpolation * this._container.offsetWidth - (this._slider.offsetWidth/2);
                    }
                    else {
                        interpolation = 1 - ((Math.acos(1 - value) / (Math.PI*0.5)));
                        this._slider.style.top = interpolation * this._container.offsetHeight - (this._slider.offsetHeight/2);
                    }
                }    
            }
            
        });
    }

    get node() {
        return this._container;
    }

    _eventCallback(event) {
        if(this._isActive) {
            const interpolation = {
                vertical : Math.clamp((event.pageY - this._container.offsetTop)/this._container.offsetHeight, 0, 0.99),
                horizontal : Math.clamp((event.pageX - this._container.offsetLeft)/this._container.offsetWidth, 0, 0.99),
            };

            const frequency = this._frequency.interpolate(interpolation.horizontal);
            const tenseness = 1 - Math.cos((1 - interpolation.vertical) * Math.PI * 0.5);
            const loudness = Math.pow(tenseness, 0.25);

            const parameters = {
                frequency : frequency,
                tenseness : tenseness,
                loudness : loudness,
            };
            
            Object.keys(parameters).forEach(parameterName => {
                this._container.dispatchEvent(new CustomEvent("setParameter", {
                    bubbles : true,
                    detail : {
                        parameterName : parameterName,
                        newValue : parameters[parameterName],
                    },
                }));
            });
        }
    }
}

export default GlottisUI