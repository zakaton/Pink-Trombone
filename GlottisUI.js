import Object from "/ObjectExtension.js";
import Touch from "/Touch.js";

class GlottisUI {
    constructor(pinkTrombone, tractCanvas, backCanvas) {
        this.pinkTrombone = pinkTrombone;
        this.tractCanvas = tractCanvas;
            this.tractContext = tractCanvas.getContext("2d");
        this.backCanvas = backCanvas;
            this.backContext = backCanvas.getContext("2d");

        this.touch = 0;

        this.semitones = 20;
        this.marks = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
        this.keyboard = {
            top : 500,
            left : 0,
            width : 600,
            height : 100,
        };

        this.drawKeyboard();
    }

    static get palePink() {
        return "#FFEEF5";
    }

    get time() {
        return Date.now()/1000;
    }

    drawKeyboard() {
        this.backContext.strokeStyle = this.backContext.fillStyle = GlottisUI.palePink;
        this.backContext.globalAlpha = 1.0;
        this.backContext.lineCap = this.backContext.lineJoin = "round";

        const radius = 2;

        this.drawBar(0.0, 0.4, 8);
        this.backContext.globalAlpha = 0.7;
        this.drawBar(0.52, 0.72, 8);

        for(let index = 0; index < this.semitones; index++) {
            const keyWidth = this.keyboard.width / this.semitones;

            const x = this.keyboard.left + (index + 1 / 2) * keyWidth;
            const y = this.keyboard.top;

            if(this.marks[(index+3) %12] == 1) {
                this.backContext.lineWidth = 4;
                this.backContext.globalAlpha = 0.4;
            }
            else {
                this.backContext.lineWidth = 3;
                this.backContext.globalAlpha = 0.2;
            }

            this.backContext.beginPath();
                this.backContext.moveTo(x, y + 9);
                this.backContext.lineTo(x, y + this.keyboard.height * 0.4 - 9);
                this.backContext.stroke();
                this.backContext.lineWidth = 3;
                this.backContext.globalAlpha = 0.15;
                this.backContext.beginPath();
                this.backContext.moveTo(x, y + this.keyboard.height * 0.52 + 6);
                this.backContext.lineTo(x, y + this.keyboard.height * 0.72 - 6);
                this.backContext.stroke();
        }

        this.backContext.fillStyle = "orchid";
        this.backContext.font = "17px Arial";
        this.backContext.textAlign = "center";
        this.backContext.globalAlpha = 0.7;
        
        this.backContext.fillText("voicebox control", 300, 490);
        this.backContext.fillText("pitch", 300, 592);
        
        this.backContext.globalAlpha = 0.3;
        this.backContext.strokeStyle = "orchid";
        this.backContext.fillStyle = "orchid";
        
        this.backContext.save()
        this.backContext.translate(410, 587);
        this.drawArrow(80, 2, 10);
        this.backContext.translate(-220, 0);
        this.backContext.rotate(Math.PI);
        this.drawArrow(80, 2, 10);
        this.backContext.restore();
        this.backContext.globalAlpha = 1.0;
    }

    drawBar(topFactor, bottomFactor, radius) {
        this.backContext.lineWidth = radius * 2;
        this.backContext.beginPath();
        this.backContext.moveTo(
            this.keyboard.left + radius,
            this.keyboard.top + topFactor * this.keyboard.height + radius);
        this.backContext.lineTo(
            this.keyboard.left + this.keyboard.width - radius,
            this.keyboard.top + topFactor * this.keyboard.height + radius);
        this.backContext.lineTo(
            this.keyboard.left + this.keyboard.width - radius,
            this.keyboard.top + bottomFactor * this.keyboard.height-radius
            );
        this.backContext.lineTo(
            this.keyboard.left + radius,
            this.keyboard.top + bottomFactor * this.keyboard.height-radius
            );
        this.backContext.closePath();
        this.backContext.stroke();
        this.backContext.fill();
    }

    drawArrow(l, ahw, ahl) {
        this.backContext.lineWidth = 2;
        this.backContext.beginPath();
        this.backContext.moveTo(-l, 0);
        this.backContext.lineTo(0,0);
        this.backContext.lineTo(0, -ahw);
        this.backContext.lineTo(ahl, 0);
        this.backContext.lineTo(0, ahw);
        this.backContext.lineTo(0,0);
        this.backContext.closePath();
        this.backContext.stroke();
        this.backContext.fill();
    }

    handleTouches(touches) {
        if(this.touch != 0 && !this.touch.alive)
            this.touch = 0;
        
        if(this.touch == 0) {
            touches.forEach(touch => {
                if(!touch.alive || touch.y < this.keyboard.top)
                    return;
                this.touch = touch;
            })
        }

        if(this.touch != 0) {
            const x = this.touch.x - this.keyboard.left;
            var y = this.touch.y - this.keyboard.top - 10;
                y = Math.clamp(y, 0, this.keyboard.height - 26);
            
            const semitone = this.semitones * x / this.keyboard.width + 0.5;

            this.pinkTrombone.glottis.frequency.UI = this.pinkTrombone.glottis.baseNote * Math.pow(2, semitone/12);
            if(this.pinkTrombone.glottis.intensity == 0)
                this.pinkTrombone.glottis.frequency.smooth = this.pinkTrombone.glottis.frequency.UI;
            
            const t = Math.clamp(1 - y / (this.keyboard.height - 28), 0, 1);

            this.pinkTrombone.glottis.tenseness.UI = 1 - Math.cos(t * Math.PI * 0.5);
            this.pinkTrombone.glottis.loudness = Math.pow(this.pinkTrombone.glottis.tenseness.UI, 0.25);

            this.pinkTrombone.glottis.x = this.touch.x;
            this.pinkTrombone.glottis.y = y + this.keyboard.top + 10;
        }

        this.pinkTrombone.glottis.isTouched = (this.touch != 0);

        [
            ["frequency", "UI"],
            ["frequency", "smooth"],
            ["tenseness", "UI"],
            ["loudness"],
            ["x"],
            ["y"],
            ["isTouched"],
        ].forEach(messagePath => {
            const newValue = Object.get(this.pinkTrombone.glottis, ...messagePath);
            this.pinkTrombone.workletNode.port.postMessage({
                type : "set",
                path : ["glottis", ...messagePath],
                value : JSON.stringify(newValue),
            });
        });
    }
}

export default GlottisUI;