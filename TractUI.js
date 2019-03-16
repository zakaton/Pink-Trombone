class TractUI {
    constructor(pinkTrombone, tractCanvas, backCanvas) {
        this.pinkTrombone = pinkTrombone;
            this.tract = {};
            this.glottis = {};

        this.tractCanvas = tractCanvas;
            this.tractContext = tractCanvas.getContext("2d");
        this.backCanvas = backCanvas;
            this.backContext = backCanvas.getContext("2d");

        this.origin = {
            x : 340,
            y : 449,
        };

        this.temp = {
            a : 0,
            b : 0,
        };

        this.radius = 298;
        this.scale = 60;

        this.tongue = {
            index : 12.9,
            diameter : 2.43,
            controlRadius : {
                inner : 2.05,
                outer : 3.5,
            },
            indexBound : {
                lower : 0, // Tract.bladeStart+2
                upper : 0, // Tract.tipStart-3
            },
            indexCenter : 0,
            touch : 0,
        };

        this.angle = {
            scale : 0.64,
            offset : -0.24,
        };

        this.offset = {
            get angle() {return this.angle.offset},
            set angle(_angle) {this.angle.offset = _angle},
            nose : 0.8,
            grid : 1.7
        };

        this.color = {
            fill : "pink",
            line : "#C070C6",
        }

        this.setRestDiameter();
        /*
        for(let index = 0; index < Tract.length, index++) {
            Tract.diameter[index] = Tract.diameter.target[index] = Tract.diameter.rest[index];
        }
        */
        this.drawBackground();
        // this.tongue.indexBound.lower = Tract.start.blade + 2;
        // this.tongue.indexBound.upper = Tract.start.tip - 3;
        
        // this.tongue.indexCenter = 0.5 * (this.tongue.indexBound.lower + this.tongue.indexBound.upper);
    }

    static get palePink() {
        return "#FFEEF5";
    }

    get time() {
        return Date.now()/1000;
    }

    update(event) {
        // store everything in a this.tract object or something...
    }

    moveTo(i, d) { // time
        // var angle = this.angle.offset + i * this.angle.scale * Math.PI / (Tract.start.lip - 1);
        // var wobble = (Tract.amplitude.max[Tract.length - 1] + Tract.nose.amplitude.max[Tract.nose.length - 1]);
            // wobble *= 0.03 * Math.sin(2 * i - 50 * time) * i / Tract.length;
            // angle += wobble
        
        // const r = this.radius - this.scale*d + 100*wobble;
        
        // this.tractContext.moveTo(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle));
    }

    lineTo(i, d) { // time
        // var angle = this.angle.offset + i * this.angle.scale * Math.PI / (Tract.start.lip - 1);
        // var wobble = (Tract.amplitude.max[Tract.length - 1] + Tract.nose.amplitude.max[Tract.nose.length - 1]);
            // wobble *= 0.03 * Math.sin(2 * i - 50 * time) * i / Tract.length
            // angle += wobble;
        
        // const r = this.radius - this.scale*d + 100*wobble;
        
        // this.tractContext.lineTo(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle));
    }

    drawText(i, d, text) {
        // const angle = this.angle.offset + i * this.angle.scale * Math.PI / (Tract.start.lip - 1);
        // const r = this.radius - this.scale * d;
        
        // this.tractContext.save();
        // this.tractContext.translate(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle) + 2);
        // this.tractContext.rotate(angle - Math.PI/2);
        // this.tractContext.fillText(text, 0, 0);
        // this.tractContext.restore();
    }

    drawTextStraight(i, d, text) {
        // const angle = this.angle.offset + i * this.angle.scale * Math.PI / Tract.start.lip - 1);
        // const r = this.radius - this.scale * d;
        
        // this.tractContext.save();
        // this.tractContext.translate(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle) + 2);
        // this.tractContext.fillText(text, 0, 0);
        // this.tractContext.restore();
    }

    drawCircle(i, d, radius) {
        // const angle = this.angle.offset + i * this.angle.scale * Math.PI / (Tract.start.lip - 1);
        // const r = this.radius - this.scale * d;

        // this.tractContext.beginPath();
        // this.tractContext.arc(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle), radius, 0, 2*Math.PI);
        // this.tractContext.fill();
    }

    getIndex(x, y) {
        // const xx = x - this.origin.x;
        // const yy = y - this.origin.y;
        // var angle = Math.atan2(yy, xx);
        // while(angle > 0) angle -= 2*Math.PI;
        // return (Math.PI + angle - this.angle.offset) * (Tract.start.lip - 1) / (this.angle.scale * Math.PI);
    }

    getDiameter(x, y) {
        // const xx = x - this.origin.x;
        // const yy = y - this.origin.y;
        // return (this.radius - Math.sqrt(xx*xx + yy*yy))/this.scale;
    }

    draw() {
        /*
        this.tractContext.clearRect(0, 0, this.tractCanvas.width, this.tractCanvas.height);
        this.tractContext.lineCap = this.tractContext.lineJoin = "round";

        this.drawTongueControl();
        this.drawPitchControl();

        const velum = Tract.nose.diameter[0];
        const velumAngle = velum * 4;

        this.tractContext.beginPath();
        this.tractContext.lineWidth = 2;
        this.tractContext.strokeStyle = this.tractContext.fillStyle = this.color.fill;
        this.tractContext.moveTo(1, 0);
        for(let index = 1; index < Tract.length; index++)
            this.tractContext.lineTo(index, Tract.diameter[index]);
        for(let index = Tract.length-1; index >= 2; index--)
            this.tractContext.lineTo(index, 0);
        this.tractContext.closePath();
        this.tractContext.stroke();
        this.tractContext.fill();

        this.tractContext.beginPath();
        this.tractContext.lineWidth = 2;
        this.tractContext.strokeStyle = this.tractContext.fillStyle = this.color.fill;
        this.moveTo(Tract.start.nose, -this.offset.nose);
        for(let index = 1; index < Tract.nose.length; index++)
            this.tractContext.lineTo(index + Tract.nose.start, -this.offset.nose - Tract.nose.diameter[index] * 0.9);
        for(let index = Tract.nose.length - 1; index >= 1; index--)
            this.tractContext.lineTo(index + Tract.start.nose; -this.offset.nose);
        this.tractContext.closePath();
        this.tractContext.fill();

        this.tractContext.beginPath();
        this.tractContext.lineWidth = 2;
        this.tractContext.strokeStyle = this.tractContext.fillStyle = this.color.fill;
        this.moveTo(Tract.start.nose - 2, 0);
        this.lineTo(Tract.start.nose, -this.offset.nose);
        this.lineTo(Tract.start.nose + velumAngle, -this.offset.nose);
        this.lineTo(Tract.start.nose + velumAngle - 2, 0);
        this.tractContext.closePath();
        this.tractContext.stroke();
        this.tractContext.fill();

        this.tractContext.fillStyle = "white";
        this.tractContext.font = "20px Arial";
        this.tractContext.textAlign = "center";
        this.tractContext.globalAlpha = 1.0;
        this.drawText(Tract.length * 0.10, 0.425, "throat");
        this.drawText(Tract.length * 0.71, -1.8, "nasal");
        this.drawText(Tract.length * 0.71, -1.3, "cavity");
        this.tractContext.font = "22px Arial";
        this.drawText(Tract.length * 0.6, 0.9, "oral");
        this.drawText(Tract.length * 0.7, 0.9, "cavity");

        this.drawAmplitudes();

        this.tractContext.beginPath();
        this.tractContext.lineWidth = 5;
        this.tractContext.strokeStyle = this.color.line;
        this.tractContext.lineJoin = this.tractContext.lineCap = 'round';
        this.moveTo(1, Tract.diameter[0]);
        for (let index = 2; index < Tract.length; index++)
            this.lineTo(index, Tract.diameter[index]);
        this.moveTo(1, 0);
        for (let index = 2; index <= Tract.start.nose - 2; index++)
            this.lineTo(index, 0);
        this.moveTo(Tract.start.nose + velumAngle - 2, 0);
        for (let index = Tract.start.nose + Math.ceil(velumAngle) - 2; index < Tract.length; index++)
            this.lineTo(index, 0);
        this.tractContext.stroke();

        this.tractContext.beginPath();
        this.tractContext.lineWidth = 5;
        this.tractContext.strokeStyle = this.color.line;
        this.tractContext.lineJoin = "round";
        this.moveTo(Tract.start.nose, -this.offset.nose);
        for(let index = 1; index < Tract.nose.length; index++)
            this.lineTo(index + Tract.start.nose, -this.nose.offset - Tract.nose.diameter[index] * 0.9);
        this.moveTo(Tract.start.nose + velumAngle, -this.nose.offset);
        for(let index = Math.ceil(velumAngle); index < Tract.nose.length; index++)
            this.lineTo(index + Tract.start.nose, -this.offset.nose);
        this.tractContext.stroke();

        this.tractContext.globalAlpha = velum * 5;
        this.tractContext.beginPath();
        this.moveTo(Tract.start.nose-2, 0);
        this.lineTo(Tract.start.nose, -this.offset.nose);
        this.moveTo(Tract.start.nose + velumAngle - 2, 0);
        this.lineTo(Tract.start.nose + velumAngle, -this.offset.nose);
        this.tractContext.stroke();

        this.tractContext.fillStyle = "orchid";
        this.tractContext.font = "20px Arial";
        this.tractContext.textAlign = "center";
        this.tractContext.globalAlpha = 0.7;
        this.drawText(Tract.length * 0.95, 0.8 + 0.8 * Tract.diameter[Tract.length - 1], " lip");

        this.tractContext.globalAlpha = 1.0;
        this.tractContext.fillStyle = "black";
        this.tractContext.textAlign = "left";
        this.tractContext.fillText(UI.debugText, 20, 20);
    */
    }

    drawBackground() {
    /*
        this.backContext.fillStyle = "orchid";
        this.backContext.font = "20px Arial";
        this.backContext.textAlign = "center";
        this.backContext.globalAlpha = 0.7;
        this.drawText(Tract.length * 0.44, -0.28, "soft");
        this.drawText(Tract.length * 0.51, -0.28, "palate");
        this.drawText(Tract.length * 0.77, -0.28, "hard");
        this.drawText(Tract.length * 0.84, -0.28, "palate");
        this.drawText(Tract.length * 0.95, -0.28, "lip");

        this.backContext.font = "17px Arial";
        this.drawTextStraight(Tract.length * 0.18, 3, " tongue control");
        this.backContext.textAlign = "left";
        this.drawText(Tract.length * 1.03, -1.07, "nasals"):
        this.drawText(Tract.length * 1.03, -0.28, "stops"):
        this.drawText(Tract.length * 1.03, 0.51, "fricatives"):
        
        this.backContext.strokeStyle = "orchid";
        this.backContext.lineWidth = 2;
        this.backContext.beginPath();
        this.moveTo(Tract.length * 1.03, 0);
            this.lineTo(Tract.length * 1.07, 0);
        this.moveTo(Tract.length * 1.03, -this.offset.nose);
            this.lineTo(Tract.length * 1.07, -this.offset.nose);
        this.backContext.stroke();
        // this.backContext.globalAlpha = 0.9;
        this.backContext.globalAlpha = 1.0;
    */
    }

    drawPositions() {
    /*
        this.tractContext.fillStyle = "orchid";
        this.tractContext.font = "24px Arial";
        this.tractContext.textAlign = "center";
        this.tractContext.globalAlpha = 0.6;
        
        const a = 2;
        const b = 1.5;

        this.drawText(15, a+b*0.60, 'æ'); //pat
        this.drawText(13, a+b*0.27, 'ɑ'); //part
        this.drawText(12, a+b*0.00, 'ɒ'); //pot
        this.drawText(17.7, a+b*0.05, '(ɔ)'); //port (rounded)
        this.drawText(27, a+b*0.65, 'ɪ'); //pit
        this.drawText(27.4, a+b*0.21, 'i'); //peat
        this.drawText(20, a+b*1.00, 'e'); //pet
        this.drawText(18.1, a+b*0.37, 'ʌ'); //putt
        this.drawText(23, a+b*0.1, '(u)'); //poot (rounded)
        this.drawText(21, a+b*0.6, 'ə'); //pert [should be ɜ]

        const nasals = -1.1;
        const stops = -0.4;
        const fricatives = 0.3;
        const approximants = 1.1;
        this.tractContext.globalAlpha = 0.8;

        this.drawText(38, approximants, 'l');
        this.drawText(41, approximants, 'w');

        this.drawText(4.5, 0.37, 'h');

        if(Glottis.isTouched || this.pinkTrombone.alwaysVoice) {
            // voiced consonants
            this.drawText(31.5, fricatives, 'ʒ');
            this.drawText(36, fricatives, 'z');
            this.drawText(41, fricatives, 'v');
            this.drawText(22, stops, 'g');
            this.drawText(36, stops, 'd');
            this.drawText(41, stops, 'b');
            this.drawText(22, nasals, 'ŋ');
            this.drawText(36, nasals, 'n');
            this.drawText(41, nasals, 'm');
        }
        else {
            // unvoiced consonants
            this.drawText(31.5, fricatives, 'ʃ');
            this.drawText(36, fricatives, 's');
            this.drawText(41, fricatives, 'f');
            this.drawText(22, stops, 'k');
            this.drawText(36, stops, 't');
            this.drawText(41, stops, 'p');
            this.drawText(22, nasals, 'ŋ');
            this.drawText(36, nasals, 'n');
            this.drawText(41, nasals, 'm');
        }
    */
    }

    drawAmplitudes() {
    /*
        this.tractContext.strokeStyle = "orchid";
        this.tractContext.lineCap = "butt";
        this.tractContext.globalAlpha = 0.3;
        for(let index = 2; index < Tract.length - 1; index++) {
            this.tractContext.beginPath();
            this.tractContext.lineWidth = Math.sqrt(Tract.amplitude.max[index])*3;
            this.moveTo(index, 0);
            this.lineTo(index, Tract.diameter[index]);
            this.tractContext.stroke();
        }

        for(let index = 1; index < Tract.nose.length - 1; index++) {
            this.tractContext.beginPath();
            this.tractContext.lineWidth = Math.sqrt(Tract.nose.amplitude.max[index])*3;
            this.moveTo(index+Tract.nose.start, -this.offset.nose);
            this.lineTo(index+Tract.nose.start, -this.offset.nose - Tract.nose.diameter[index]*0.9);
            this.tractContext.stroke();
        }

        this.tractContext.globalAlpha = 1;
    */
    }

    drawTongueControl() {
    /*
        this.tractContext.lineCap = this.tractContext.lineJoin = "round";
        this.tractContext.strokeStyle = this.tractContext.fillStyle = TractUI.palePink;
        this.tractContext.globalAlpha = 1.0;
        this.tractContext.beginPath();
        this.tractContext.lineWidth = 45;

        this.moveTo(this.tongue.indexBound.lower, this.tongue.controlRadius.inner);
        for(let index = this.tongue.indexBound.lower+1; index <= this.tongue.indexBound.upper; index++)
            this.lineTo(index, this.tongue.controlRadius.inner);
        this.lineTo(this.tongue.indexCenter, this.tongue.controlRadius.outer);
        this.tractContext.closePath();
        this.tractContext.stroke();
        this.tractContext.fill();

        const a = this.tongue.controlRadius.inner;
        const c = this.tongue.controlRadius.outer;
        const b = 0.5 * (a+c);
        const r = 3;

        this.tractContext.fillStyle = "orchid";
        this.tractContext.globalAlpha = 0.3;
        this.drawCircle(this.tongue.indexCenter, a, r);
        this.drawCircle(this.tongue.indexCenter - 4.25, a, r);
        this.drawCircle(this.tongue.indexCenter - 8.5, a, r);
        this.drawCircle(this.tongue.indexCenter + 4.25, a, r);
        this.drawCircle(this.tongue.indexCenter + 8.5, a, r);
        this.drawCircle(this.tongue.indexCenter - 6.1, b, r);
        this.drawCircle(this.tongue.indexCenter + 6.1, b, r);
        this.drawCircle(this.tongue.indexCenter, b, r);
        this.drawCircle(this.tongue.indexCenter, c, r);

        this.tractContext.globalAlpha = 1.0;

        const angle = this.angle.offset + this.tongue.index * this.angle.scale * Math.PI / (Tract.start.lip-1);
        const r = this.radius - this.scale*(this.tongue.diameter);
        const x = this.origin.x - r * Math.cos(angle);
        const y = this.origin.y - r * Math.sin(angle);
        
        this.tractContext.lineWidth = 4;
        this.tractContext.strokeStyle = "orchid";
        this.tractContext.globalAlpha = 0.7;
        this.tractContext.beginPath();
        this.tractContext.arc(x , y, 18, 0, 2*Math.PI);
        this.tractContext.stroke();
        this.tractContext.globalAlpha = 0.15;
        this.tractContext.fill();
        this.tractContext.globalAlpha = 1.0;
        this.tractContext.fillStyle = "orchid";
    */
    }

    drawPitchControl() {
    /*
        const w = 9;
        const h = 15;

        if(Glottis.x) {
            this.tractContext.lineWidth = 4;
            this.tractContext.strokeStyle = "orchid";
            this.tractContext.globalAlpha = 0.7;
            this.tractContext.beginPath();
            this.tractContext.moveTo(Glottis.x-w, Glottis.y-h);
            this.tractContext.lineTo(Glottis.x+w, Glottis.y-h);
            this.tractContext.lineTo(Glottis.x+w, Glottis.y+h);
            this.tractContext.lineTo(Glottis.x-w, Glottis.y+h);
            this.tractContext.closePath();
            this.tractContext.stroke();
            this.tractContext.globalAlpha = 0.15;
            this.tractContext.fill();
            this.tractContext.globalAlpha = 1.0;
        }
    */
    }

    setRestDiameter() {
    /*
        for(let index = Tract.start.blade; index < Tract.start.lip; index++) {
            const t = 1.1 * Math.PI * (this.tongue.index - index) / (Tract.start.tip - Tract.start.blade);
            const fixedTongueDiameter = 2 + (this.tongue.diameter - 2)/1.5;
            
            var curve = (1.5 - fixedTongueDiameter + this.offset.grid) * Math.cos(t);
            if(index == Tract.start.blade-2 || index == Tract.start.lip-1)
                curve *= 0.8;
            if(index == Tract.start.blade || index == Tract.start.lip - 2)
                curve *= 0.94;

            Tract.diameter.rest[index] = 1.5 - curve;
        }
    */
    }

    handleTouches(touches) {
    /*
        if(this.tongue.touch != 0 && !this.tongue.touch.alive)
            this.tongue.touch = 0;
        
        if(this.tongue.touch == 0) {
            touches.forEach(touch => {
                if(!touch.alive || touch.fricative_intensity == 1)
                    return;
                const x = touch.x;
                const y = touch.y;
                const index = this.getIndex(x, y);
                const diameter = this.getDiameter(x, y);
                
                if(index >= this.tongue.indexBound.lower-4 && index <= this.tongue.indexBound.upper+4 && diameter >= this.tongue.controlRadius.inner-0.5 && diameter <== this.tongue.controlRadius.outer+0.5)
                    this.tongue.touch = touch;
            })
        }

        if(this.tongue.touch != 0) {
            const x = this.tongue.touch.x;
            const y = this.tongue.touch.y;
            const index = this.getIndex(x, y);
            const diameter = this.getDiameter(x, y);
            
            var fromPoint = (this.tongue.controlRadius.outer - diameter) / (this.tongue.controlRadius.outer - this.tongue.controlRadius.inner);
                fromPoint = Math.clamp(fromPoint, 0, 1);
                fromPoint = Math.pow(fromPoint, 0.58) - 0.2*(fromPoint*fromPoint-fromPoint);
            this.tongue.diameter = Math.clamp(diameter, this.tongue.controlRadius.inner, this.tongue.controlRadius.outer);
            const out = fromPoint * 0.5 * (this.tongue.indexBound.upper - this.tongue.indexBound.lower);
            this.tongue.index = Math.clamp(index, this.tongue.indexCenter - out, this.tongue.indexCenter + out);
        }

        this.setRestDiameter();
        for(let index = 0; index < Tract.length; index++)
            Tract.diameter.target[index] = Tract.diameter.rest[index];
        
        Tract.velum.target = 0.01;
        touches.forEach(touch => {
            if(!touch.alive)
                return;
            
            const x = touch.x;
            const y = touch.y;
            const index = this.getIndex(x, y);
            var diameter = this.getDiameter(x, y);
            if(index > Tract.start.nose && diameter < -this.offset.nose)
                Tract.velum.target = 0.4;
            
            this.temp.a = index;
            this.temp.b = diameter;

            if(diameter < -0.85 - this.offset.nose)
                return;
            
            diameter -= 0.3;

            if(diamter < 0)
                return;
            
            var width = 2;
            if(index < 25)
                width = 10;
            else if(index >= Tract.start.tip)
                width = 5;
            else
                width = 10 - 5 * (index-25) / (Tract.start.tip-25);
            
            if(index >= 2 && index < Tract.length && y < this.tractCanvas.height && diameter < 3) {
                const intIndex = Math.round(index);
                for(let _index = -Math.ceil(width)-1; _index < width+1; _index++) {
                    if(intIndex + _index < 0 || intIndex + _index >= Tract.length)
                        return;
                    
                    var relpos = (intIndex + _index) - index;
                        relpos = Math.abs(relpos) - 0.5;
                    
                    var shrink;
                    if(relpos <= 0)
                        shrink = 0;
                    else if(relpos > width)
                        shrink = 1;
                    else
                        shrink = 0.5 * (1 - Math.cos(Math.PI * relpos / width));
                    
                    if(diameter < Tract.diameter.target[intIndex + _index])
                        Tract.diameter.target[intIndex + _index] = diameter + (Tract.diameter.target[intIndex + _index] - diameter) * shrink;
                }
            }
        })
    */
    }
}

export default TractUI;