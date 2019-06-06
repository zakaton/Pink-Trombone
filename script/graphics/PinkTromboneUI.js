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

            this._container.style.display = "grid";
                this._container.style.gridTemplateRows = "auto 200px 100px";
                this._container.style.gridTemplateColumns = "auto 100px";
                this._container.style.gridRowGap = "5px";

            this._container.appendChild(this._tractUI.node);
                this._tractUI.node.id = "tractUI";
                this._tractUI.node.style.gridColumn = "1 / span 2";
                this._tractUI.node.style.gridRow = "1 / span 2";

            this._container.appendChild(this._glottisUI.node);
                this._glottisUI.node.id = "glottisUI";
                this._glottisUI.node.style.gridColumn = "1 / span 2"
                this._glottisUI.node.style.gridRow = "3";
            
            this._container.appendChild(this._buttonsUI.node);
                this._buttonsUI.node.id = "buttonsUI";
                this._buttonsUI.node.style.zIndex = 1;
                this._buttonsUI.node.style.gridColumn = "2";
                this._buttonsUI.node.style.gridRow = "2";
    }

    get node() {
        return this._container;
    }
}

export default PinkTromboneUI;