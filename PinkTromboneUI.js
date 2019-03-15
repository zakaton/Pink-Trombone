import Math from "/MathExtension.js";

import TractUI from "/TractUI.js";
import GlottisUI from "/GlottisUI.js";

import Touch from "/Touch.js";
import Button from "/Button.js";

class PinkTromboneUI {
    constructor(pinkTrombone) {
        this.pinkTrombone = pinkTrombone;

        this.width = 600;
        this.margin = {
            top : 5,
            left : 5,
        };
        this.inAboutScreen = true;
        this.inInstructionsScreen = false;
        this.instructionsLine = 0;
        this.debugText = "";

        ["tract", "back"].forEach((canvasPrefix, index) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = canvas.height = this.width;
            canvas.style.position = "absolute";
            canvas.style.backgroundColor = "transparent";
            canvas.style.margin = 0;
            canvas.style.padding = 0;

            canvas.style.zIndex = 1 - index;

            canvas.id = canvasPrefix + "Canvas"

            this[canvasPrefix + "Canvas"] = canvas;
            this[canvasPrefix + "Context"] = context;

            document.body.appendChild(canvas);
        })

        this.tractUI = new TractUI(this.pinkTrombone, this.tractCanvas, this.backCanvas);
        this.glottisUI = new GlottisUI(this.pinkTrombone, this.tractCanvas, this.backCanvas);

        this.mouse = {
            touches : [],
            touch : {alive: false, endTime: 0}, // replace with new Touch() later
            down : false,
        };

        this.aboutButton = new Button(460, 392, 140, 30, "about...", true);
        this.alwaysVoiceButton = new Button(460, 428, 140, 30, "always voice", true);
        this.autoWobbleButton = new Button(460, 464, 140, 30, "pitch wobble", true);

        this.tractCanvas.addEventListener("touchstart", this.startTouches);
        this.tractCanvas.addEventListener("touchmove", this.moveTouches);
        this.tractCanvas.addEventListener("touchend", this.endTouches);
        this.tractCanvas.addEventListener("touchcancel", this.endTouches);

        document.addEventListener("touchstart", event => {
            event.preventDefault();
        });

        document.addEventListener("mousedown", event => {
            this.mouse.down = true;
            event.preventDefault();
            this.startMouse(event);
        });

        document.addEventListener("mouseup", event => {
            this.mouse.down = false;
            event.preventDefault();
            this.endMouse(event);
        });

        document.addEventListener("mousemove", (event) => this.moveMouse(event));
    }

    get time() {
        return Date.now()/1000;
    }

    draw() {
        this.alwaysVoiceButton.draw(this.tractContext);
        this.autoWobbleButton.draw(this.tractContext);
        this.aboutButton.draw(this.tractContext);
        
        if(this.inAboutScreen)
            this.drawAboutScreen();
        else if(this.inInstructionsScreen)
            this.drawInstructionsScreen();
    }

    drawAboutScreen() {
        this.tractContext.globalAlpha = 0.8;
        this.tractContext.fillStyle = "white";
        this.tractContext.rect(0, 0, 600, 600);
        this.tractContext.fill();

        this.drawAboutText();
    }

    drawAboutText() {
        const context = this.tractContext;
            context.globalAlpha = 1.0;
            context.fillStyle = "#C070C6";
            context.strokeStyle = "#C070C6";
            context.font = "50px Arial";
            context.lineWidth = 3;
            context.textAlign = "center";
            context.strokeText("P i n k   T r o m b o n e", 300, 230);
            context.fillText("P i n k   T r o m b o n e", 300, 230);

            context.font = "28px Arial";
            context.fillText("bare-handed speech synthesis", 300, 330);

            context.font = "20px Arial";
            context.fillText("(tap to start)", 300, 380);
    }

    drawInstructionsScreen() {
        if(window.pinkTrombone)
            this.stop();
                
        const context = this.tractContext;
            context.globalAlpha = 0.85;
            context.fillStyle = "white";
            context.rect(0,0,600,600);
            context.fill();
            context.globalAlpha = 1.0;
            context.fillStyle = "#C070C6";
            context.strokeStyle = "#C070C6";
            context.font="24px Arial";
            context.lineWidth = 2;
            context.textAlign = "center";
            context.font = "19px Arial";
            context.textAlign = "left";
            this.instructionsLine = 0;
            this.write("Sound is generated in the glottis (at the bottom left) then ");
            this.write("filtered by the shape of the vocal tract. The voicebox ");
            this.write("controls the pitch and intensity of the initial sound.");
            this.write("");
            this.write("Then, to talk:");
            this.write("");
            this.write("- move the body of the tongue to shape vowels");
            this.write("");
            this.write("- touch the oral cavity to narrow it, for fricative consonants");
            this.write("");
            this.write("- touch above the oral cavity to close it, for stop consonants");
            this.write("");
            this.write("- touch the nasal cavity to open the velum and let sound ");
            this.write("   flow through the nose.");
            this.write("");
            this.write("");
            this.write("(tap anywhere to continue)");
            context.textAlign = "center";
            context.fillText("[tap here to RESET]", 470, 535);
            this.instructionsLine = 18.8;
            context.textAlign = "left";
            this.write("Pink Trombone v1.1");
            this.write("by Neil Thapen");
            context.fillStyle = "blue";
            context.globalAlpha = 0.6;
            this.write("venuspatrol.nfshost.com");
            context.globalAlpha = 1.0;
    }

    instructionsScreenHandleTouch(x, y) {
        if ((x >=35 && x<=265) && (y>=535 && y<=570))
            window.location.href = "http://venuspatrol.nfshost.com";
        else if ((x>=370 && x<=570) && (y>=505 && y<=555))
            location.reload(false);
        else
            {
                this.inInstructionsScreen = false;
                this.aboutButton.switchedOn = true;
                if(window.pinkTrombone)
                    pinkTrombone.start();
            }
    }

    write(text) {
        this.tractContext.fillText(text, 50, 100 + this.instructionsLine*22);
        this.instructionsLine += 1;
        if(text == '')
            this.instructionsLine -= 0.3;
    }

    buttonsHandleTouchStart(touch) {
        if(window.pinkTrombone) {
            this.alwaysVoiceButton.handleTouchStart(touch);
            window.pinkTrombone.alwaysVoice = this.alwaysVoiceButton.switchedOn
            
            this.autoWobbleButton.handleTouchStart(touch);
            window.pinkTrombone.alwaysWobble = this.autoWobbleButton.switchedOn;
            
            this.aboutButton.handleTouchStart(touch);
        }
    }

    startTouches(event) {
        if(window.pinkTrombone) {
            event.preventDefault();
            if(!window.pinkTrombone.started)
                window.pinkTrombone.start();
            
            if(this.inAboutScreen) {
                this.inAboutScreen = false;
                return;
            }

            if(this.inInstructionsScreen) {
                // possible issue?
                event.changedTouches.forEach(touch => {
                    const x = (touch.pageX - this.margin.left) / this.width * 600;
                    const y = (touch.pageY - this.margin.top) / this.width * 600;
                    
                    this.instructionsScreenHandleTouch(x, y);
                })
                return;
            }

            event.changedTouches.forEach(changedTouch => {
                const touch = new Touch();
                    Object.assign(touch, {
                        startTime : this.time,
                        endTime : 0,
                        fricative_intensity : 0,
                        alive : true,
                        id : changedTouch.identifier,
                        x : (changedTouch.pageX - this.margin.left) / this.width * 600,
                        y : (changedTouch.pageY - this.margin.top) / this.width * 600,
                        index : this.tractUI.getIndex(changedTouch.x, changedTouch.y),
                        diameter : this.tractUI.getDiameter(changedTouch.x, changedTouch.y),
                    })
                this.mouse.touches.push(touch);
                this.buttonsHandleTouchStart(touch);
            });

            this.handleTouches();
        }
    }

    getTouchById(id) {
        return this.mouse.touches.find(touch => touch.id == id && touch.isAlive);
    }

    moveTouches(event) {
        event.changedTouches.forEach(changedTouch => {
            const touch = this.getTouchById(changedTouch.identifier);
            if(touch) {
                touch.x = (changedTouch.pageX - this.margin.left) / this.width * 600;
                touch.y = (changedTouch.pageY - this.margin.top) / this.width * 600;

                touch.index = this.tractUI.getIndex(touch.x, touch.y);
                touch.diameter = this.tractUI.getDiameter(touch.x, touch.y);
            }
        });

        this.handleTouches();
    }

    endTouches(event) {
        event.changedTouches(changedTouch => {
            const touch = this.getTouchById(changedTouch.identifier);
            if(touch) {
                touch.isAlive = false;
                touch.endTime = this.time
            }
        });

        this.handleTouches();
    }

    startMouse(event) {
        if(window.pinkTrombone && !window.pinkTrombone.started) {
            this.start();
        }

        if(this.inAboutScreen) {
            this.inAboutScreen = false;
            return;
        }

        if(this.inInstructionsScreen) {
            const x = (event.pageX - this.tractCanvas.offsetLeft) / this.width * 600;
            const y = (event.pageY - this.tractCanvas.offsetTop) / this.width * 600;
            
            this.instructionsScreenHandleTouch(x, y);
            return;
        }

        const touch = new Touch();
        Object.assign(touch, {
            startTime : this.time,
            fricative_intensity : 0,
            endTime : 0,
            alive : true,
            id : "mouse"+Math.random(),
            x : (event.pageX - this.tractCanvas.offsetLeft) / this.width * 600,
            y : (event.pageY - this.tractCanvas.offsetTop) / this.width * 600,
        });
        Object.assign(touch, {
            index : this.tractUI.getIndex(touch.x, touch.y),
            diameter : this.tractUI.getDiameter(touch.x, touch.y),
        });

        this.mouse.touch = touch;
        this.mouse.touches.push(touch);

        this.buttonsHandleTouchStart(touch);
        this.handleTouches();
    }

    moveMouse(event) {
        const touch = this.mouse.touch;
        if(touch.alive) {
            touch.x = (event.pageX - this.tractCanvas.offsetLeft) / this.width * 600;
            touch.y = (event.pageY - this.tractCanvas.offsetTop) / this.width * 600;

            touch.index = this.tractUI.getIndex(touch.x, touch.y);
            touch.diameter = this.tractUI.getDiameter(touch.x, touch.y);

            this.handleTouches();
        }
    }

    endMouse(event) {
        const touch = this.mouse.touch;
        if(touch.alive) {
            touch.alive = false;
            touch.endTime = this.time;
            
            this.handleTouches();

            if(!this.aboutButton.switchedOn)
                this.inInstructionsScreen = true;
        }
    }

    handleTouches(event) {
        this.tractUI.handleTouches(this.mouse.touches);
        this.glottisUI.handleTouches(this.mouse.touches);
    }

    updateTouches() {
        this.mouse.touches.slice().reverse().forEach((touch, index) => {
            if(!touch.alive && (this.time > touch.endTime + 1))
                this.mouse.touches.splice(index, 1);
            else if(touch.alive)
                touch.fricative_intensity = Math.clamp((this.time - touch.startTime)/Touch.fricativeAttackTime, 0, 1);
            else
                touch.fricative_intensity = Math.clamp(1 - (this.time - touch.endTime)/Touch.fricativeAttackTime, 0, 1);
        })
    }

    shapeToFitScreen() {
        if(window.innerWidth <= window.innerHeight) {
            this.width = window.innerWidth - 10;
            
            this.margin.left = 5;
            this.margin.top = 0.5 * (window.innerHeight - this.width);
        }
        else {
            this.width = window.innerHeight - 10;

            this.margin.left = 0.5 * (window.innerWidth - this.width);
            this.margin.top = 5;
        }

        document.body.style.marginLeft = this.margin.left;
        document.body.style.marginTop = this.margin.top;

        this.tractCanvas.style.width = this.backCanvas.style.width = this.width;
    }

    redraw(highResTimestamp) {
        this.shapeToFitScreen();
        this.tractUI.draw();
        this.draw();
        window.requestAnimationFrame(TS => this.redraw(TS));
        this.updateTouches();
    }

    start() {
        this.pinkTrombone.connect(this.pinkTrombone.audioContext.destination);
        this.pinkTrombone.start();
    }
    stop() {
        this.pinkTrombone.stop();
    }
    render() {
        window.requestAnimationFrame(highResTimestamp => this.redraw(highResTimestamp))
    }
}

export default PinkTromboneUI;