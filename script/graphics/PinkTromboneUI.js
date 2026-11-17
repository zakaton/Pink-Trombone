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

    Object.assign(this._container.style, {
      width: "100%",
      height: "100%",
      minWidth: "0",
      minHeight: "0",

      display: "grid",
      gridTemplateRows: "minmax(0, 1fr) 100px",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "5px",

      overflow: "hidden",
    });

    this._container.appendChild(this._tractUI.node);

    Object.assign(this._tractUI.node.style, {
      gridColumn: "1",
      gridRow: "1",

      position: "relative",
      width: "100%",
      height: "100%",
      minWidth: "0",
      minHeight: "0",
      overflow: "hidden",
    });

    this._tractUI.node.id = "tractUI";

    this._container.appendChild(this._glottisUI.node);

    Object.assign(this._glottisUI.node.style, {
      gridColumn: "1",
      gridRow: "2",
      width: "100%",
      minWidth: "0",
    });

    this._glottisUI.node.id = "glottisUI";

    this._container.appendChild(this._buttonsUI.node);

    Object.assign(this._buttonsUI.node.style, {
      position: "absolute",
      zIndex: "2",
      top: "5px",
      right: "5px",
      width: "90px",
    });

    this._buttonsUI.node.id = "buttonsUI";

    const TRACT_WIDTH = 600;
    const TRACT_HEIGHT = 500;

    this._tractResizeObserver = new ResizeObserver(() => {
      const container = this._tractUI.node;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scale = Math.min(width / TRACT_WIDTH, height / TRACT_HEIGHT);

      const canvasWidth = TRACT_WIDTH * scale;
      const canvasHeight = TRACT_HEIGHT * scale;

      for (const canvas of container.querySelectorAll("canvas")) {
        Object.assign(canvas.style, {
          position: "absolute",
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          left: `${(width - canvasWidth) / 2}px`,
          top: `${(height - canvasHeight) / 2}px`,
        });
      }
    });

    this._tractResizeObserver.observe(this._tractUI.node);

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
    this.node.style.display = "grid";
  }
  hide() {
    this.node.style.display = "none";
  }
}

export default PinkTromboneUI;
