/*
    TODO
        Toggle phonemes (voice/voiceless/none)
*/

class ButtonsUI {
    constructor() {
        this._container = document.createElement("div");
        this._container.style.display = "flex";
        this._container.style.flexDirection = "column";

        this._buttons = {
            start : this._createButton("start"),
            wobble : this._createButton("wobble", true, "vibrato.wobble"),
            voice : this._createButton("voice", true, "intensity"),
        };

        this._buttons.start.addEventListener("didResume", event => {
            event.target.parentElement.removeChild(event.target);
        });
        this._buttons.start.addEventListener("click", event => {
            event.target.dispatchEvent(new CustomEvent("resume", {
                bubbles : true,
            }));

        });
    }

    get node() {
        return this._container;
    }

    _createButton(buttonName, isParameter = false, parameterPath) {
        const button = document.createElement("button");
                button.id = buttonName;
                button.value = true;
                button.innerText = (isParameter? "disable":'') + buttonName;
                button.style.width = "100%";
                button.style.flex = 1;
                button.style.margin = "2px";
                button.style.borderRadius = "20px";
                button.style.backgroundColor = "pink";
                button.style.border = "solid red";
            this._container.appendChild(button);

            if(isParameter) {
                button.addEventListener("click", event => {
                    button.value = (button.value == "false");

                    const prefix = (button.value == "true")?
                        "disable" :
                        "enable";
                    button.innerText = prefix + ' ' + button.id;
                    
                    const customEvent = new CustomEvent("setParameter", {
                        bubbles : true,
                        detail : {
                            parameterName : parameterPath || buttonName,
                            newValue : (button.value == "true")? 1:0,
                        }
                    });
                    button.dispatchEvent(customEvent);
                });

                button.addEventListener("didSetParameter", event => {
                    // like a promise...
                });    
            }
        return button;
    }
}

export default ButtonsUI;