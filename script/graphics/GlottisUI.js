/*
    TODO
        mouseY
        touch
        set actual frequency range
        mousedown turns on voice/loudness and VV
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
        });
        this._container.addEventListener("mousemove", event => {
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
                
                // add a delay for a rise and fall for voice?
                Object.keys(parameters).forEach(parameterName => {
                    const customEvent = new CustomEvent("setParameter", {
                        bubbles : true,
                        detail : {
                            parameterName : parameterName,
                            newValue : parameters[parameterName],
                        },
                    });
                    this._container.dispatchEvent(customEvent);
                });
            }
        });
        this._container.addEventListener("mouseup", event => {
            this._isActive = false;
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
                    },
                });
                event.target.dispatchEvent(customEvent);
            });
        });


        // EventListeners for Getting Parameters
        this._container.addEventListener("didGetParameter", event => {
            const parameterName = event.detail.parameterName;
            const value = event.detail.value;

            if(["frequency", "tenseness"].includes(parameterName)) {
                var interpolation;

                if(parameterName == "frequency") {
                    interpolation = Math.clamp(((value-this._frequency.min)/this._frequency.range));
                    this._slider.style.left = interpolation * this._container.offsetWidth - (this._slider.offsetWidth/2);
                }
                else {
                    interpolation = 1-Math.clamp(value);
                    this._slider.style.top = interpolation * this._container.offsetHeight - (this._slider.offsetHeight/2);
                }
            }
        });
    }

    get node() {
        return this._container;
    }
}

export default GlottisUI