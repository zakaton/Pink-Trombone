/*
    TODO
        .setFreqeuncyRange(min, max)
*/

import TractUI from "./TractUI.js";
import GlottisUI from "./GlottisUI.js";
import ButtonsUI from "./ButtonsUI.js";

class PinkTromboneUI {
  constructor() {
    this._tractUI = new TractUI();
    this._glottisUI = new GlottisUI();
    this._buttonsUI = new ButtonsUI();

    this._container = document.createElement("div");
    this._container.style.height = "100%";
    this._container.style.width = "100%";

    this._container.style.position = "relative";
    this._container.style.display = "flex";
    this._container.style.flexDirection = "column";

    this._container.appendChild(this._tractUI.node);
    this._tractUI.node.id = "tractUI";
    this._tractUI.node.style.flex = "1";
    this._tractUI.node.style.position = "relative";

    this._container.appendChild(this._glottisUI.node);
    this._glottisUI.node.id = "glottisUI";
    this._glottisUI.node.style.height = "80px";

    this._container.appendChild(this._buttonsUI.node);
    this._buttonsUI.node.id = "buttonsUI";
    this._buttonsUI.node.style.zIndex = 1;
    this._buttonsUI.node.style.position = "absolute";
    this._buttonsUI.node.style.top = "0";
    this._buttonsUI.node.style.right = "0";

    this._container.addEventListener("message", (event) => {
      event.stopPropagation();
      Array.from(this._container.children).forEach((child) => {
        if (child !== event.target) {
          child.dispatchEvent(
            new CustomEvent("message", {
              detail: event.detail,
            }),
          );
        }
      });
    });
  }

  get node() {
    return this._container;
  }

  show() {
    this.node.style.display = "flex";
  }
  hide() {
    this.node.style.display = "none";
  }
}

export default PinkTromboneUI;
