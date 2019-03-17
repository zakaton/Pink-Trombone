// setting Values?
// rendering

class TractUI {
    constructor(pinkTrombone, tractCanvas, backCanvas) {
        this.pinkTrombone = pinkTrombone;
            this.tract = {};
            this.glottis = {};

        this.tractCanvas = tractCanvas;
            this.tractContext = tractCanvas.getContext("2d");
        this.backCanvas = backCanvas;
            this.backContext = backCanvas.getContext("2d");
        
        this.context = this.tractContext;

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
                lower : 0,
                upper : 0,
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
        for(let index = 0; index < this.pinkTrombone.tract.length; index++) {
            this.pinkTrombone.tract.diameter[index] = this.pinkTrombone.tract.diameter.target[index] = this.pinkTrombone.tract.diameter.rest[index];
        }
        this.drawBackground();
        this.tongue.indexBound.lower = this.pinkTrombone.tract.start.blade + 2;
        this.tongue.indexBound.upper = this.pinkTrombone.tract.start.tip - 3;
        
        this.tongue.indexCenter = 0.5 * (this.tongue.indexBound.lower + this.tongue.indexBound.upper);
    }

    static get palePink() {
        return "#FFEEF5";
    }

    get time() {
        return Date.now()/1000;
    }

    moveTo(i, d) {
        var angle = this.angle.offset + i * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip - 1);
        var wobble = (this.pinkTrombone.tract.amplitude.max[this.pinkTrombone.tract.length - 1] + this.pinkTrombone.tract.nose.amplitude.max[this.pinkTrombone.tract.nose.length - 1]);
            wobble *= 0.03 * Math.sin(2 * i - 50 * this.time) * i / this.pinkTrombone.tract.length;
            angle += wobble
        
        const r = this.radius - this.scale*d + 100*wobble;
        
        this.context.moveTo(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle));
    }

    lineTo(i, d) {
        var angle = this.angle.offset + i * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip - 1);
        var wobble = (this.pinkTrombone.tract.amplitude.max[this.pinkTrombone.tract.length - 1] + this.pinkTrombone.tract.nose.amplitude.max[this.pinkTrombone.tract.nose.length - 1]);
            wobble *= 0.03 * Math.sin(2 * i - 50 * this.time) * i / this.pinkTrombone.tract.length
            angle += wobble;
        
        const r = this.radius - this.scale*d + 100*wobble;
        
        this.context.lineTo(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle));
    }

    drawText(i, d, text) {
        const angle = this.angle.offset + i * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip - 1);
        const r = this.radius - this.scale * d;
        
        this.context.save();
        this.context.translate(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle) + 2);
        this.context.rotate(angle - Math.PI/2);
        this.context.fillText(text, 0, 0);
        this.context.restore();
    }

    drawTextStraight(i, d, text) {
        const angle = this.angle.offset + i * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip - 1);
        const r = this.radius - this.scale * d;
        
        this.context.save();
        this.context.translate(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle) + 2);
        this.context.fillText(text, 0, 0);
        this.context.restore();
    }

    drawCircle(i, d, radius) {
        const angle = this.angle.offset + i * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip - 1);
        const r = this.radius - this.scale * d;

        this.context.beginPath();
        this.context.arc(this.origin.x - r * Math.cos(angle), this.origin.y - r * Math.sin(angle), radius, 0, 2*Math.PI);
        this.context.fill();
    }

    getIndex(x, y) {
        const xx = x - this.origin.x;
        const yy = y - this.origin.y;
        var angle = Math.atan2(yy, xx);
        while(angle > 0)
            angle -= 2*Math.PI;
        return (Math.PI + angle - this.angle.offset) * (this.pinkTrombone.tract.start.lip - 1) / (this.angle.scale * Math.PI);
    }

    getDiameter(x, y) {
        const xx = x - this.origin.x;
        const yy = y - this.origin.y;
        return (this.radius - Math.sqrt(xx*xx + yy*yy))/this.scale;
    }

    draw() {
        this.context.clearRect(0, 0, this.tractCanvas.width, this.tractCanvas.height);
        this.context.lineCap = "round";
        this.context.lineJoin = "round";

        this.drawTongueControl();
        this.drawPitchControl();

        const velum = this.pinkTrombone.tract.nose.diameter[0];
        const velumAngle = velum * 4;

        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = this.color.fill;
        this.context.fillStyle = this.color.fill;
        this.moveTo(1, 0);

        for(let index = 1; index < this.pinkTrombone.tract.length; index++)
            this.lineTo(index, this.pinkTrombone.tract.diameter[index]);
        
        for(let index = this.pinkTrombone.tract.length-1; index >= 2; index--)
            this.lineTo(index, 0);
        
        this.context.closePath();
        this.context.stroke();
        this.context.fill();

        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = this.color.fill
        this.context.fillStyle = this.color.fill;
        this.moveTo(this.pinkTrombone.tract.nose.start, -this.offset.nose);
        for(let index = 1; index < this.pinkTrombone.tract.nose.length; index++)
            this.lineTo(index + this.pinkTrombone.tract.nose.start, -this.offset.nose - this.pinkTrombone.tract.nose.diameter[index] * 0.9);
        for(let index = this.pinkTrombone.tract.nose.length - 1; index >= 1; index--)
            this.lineTo(index + this.pinkTrombone.tract.nose.start, -this.offset.nose);
        this.context.closePath();
        this.context.fill();

        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = this.context.fillStyle = this.color.fill;
        this.moveTo(this.pinkTrombone.tract.nose.start - 2, 0);
        this.lineTo(this.pinkTrombone.tract.nose.start, -this.offset.nose);
        this.lineTo(this.pinkTrombone.tract.nose.start + velumAngle, -this.offset.nose);
        this.lineTo(this.pinkTrombone.tract.nose.start + velumAngle - 2, 0);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();

        this.context.fillStyle = "white";
        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.globalAlpha = 1.0;
        this.drawText(this.pinkTrombone.tract.length * 0.10, 0.425, "throat");
        this.drawText(this.pinkTrombone.tract.length * 0.71, -1.8, "nasal");
        this.drawText(this.pinkTrombone.tract.length * 0.71, -1.3, "cavity");
        
        this.context.font = "22px Arial";
        this.drawText(this.pinkTrombone.tract.length * 0.6, 0.9, "oral");
        this.drawText(this.pinkTrombone.tract.length * 0.7, 0.9, "cavity");

        this.drawAmplitudes();

        this.context.beginPath();
        this.context.lineWidth = 5;
        this.context.strokeStyle = this.color.line;
        this.context.lineJoin = this.context.lineCap = 'round';
        this.moveTo(1, this.pinkTrombone.tract.diameter[0]);
        for (let index = 2; index < this.pinkTrombone.tract.length; index++)
            this.lineTo(index, this.pinkTrombone.tract.diameter[index]);
        this.moveTo(1, 0);
        for (let index = 2; index <= this.pinkTrombone.tract.nose.start - 2; index++)
            this.lineTo(index, 0);
        this.moveTo(this.pinkTrombone.tract.nose.start + velumAngle - 2, 0);
        for (let index = this.pinkTrombone.tract.nose.start + Math.ceil(velumAngle) - 2; index < this.pinkTrombone.tract.length; index++)
            this.lineTo(index, 0);
        this.context.stroke();

        this.context.beginPath();
        this.context.lineWidth = 5;
        this.context.strokeStyle = this.color.line;
        this.context.lineJoin = "round";
        this.moveTo(this.pinkTrombone.tract.nose.start, -this.offset.nose);
        for(let index = 1; index < this.pinkTrombone.tract.nose.length; index++)
            this.lineTo(index + this.pinkTrombone.tract.nose.start, -this.offset.nose - this.pinkTrombone.tract.nose.diameter[index] * 0.9);
        this.moveTo(this.pinkTrombone.tract.nose.start + velumAngle, -this.offset.nose);
        for(let index = Math.ceil(velumAngle); index < this.pinkTrombone.tract.nose.length; index++)
            this.lineTo(index + this.pinkTrombone.tract.nose.start, -this.offset.nose);
        this.context.stroke();

        this.context.globalAlpha = velum * 5;
        this.context.beginPath();
        this.moveTo(this.pinkTrombone.tract.nose.start-2, 0);
        this.lineTo(this.pinkTrombone.tract.nose.start, -this.offset.nose);
        this.moveTo(this.pinkTrombone.tract.nose.start + velumAngle - 2, 0);
        this.lineTo(this.pinkTrombone.tract.nose.start + velumAngle, -this.offset.nose);
        this.context.stroke();

        this.context.fillStyle = "orchid";
        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.globalAlpha = 0.7;
        this.drawText(this.pinkTrombone.tract.length * 0.95, 0.8 + 0.8 * this.pinkTrombone.tract.diameter[this.pinkTrombone.tract.length - 1], " lip");

        this.context.globalAlpha = 1.0;
        this.context.fillStyle = "black";
        this.context.textAlign = "left";
        //this.context.fillText("debugText", 20, 20);
    }

    drawBackground() {
        this.context = this.backContext;

        this.context.fillStyle = "orchid";
        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.globalAlpha = 0.7;
        this.drawText(this.pinkTrombone.tract.length * 0.44, -0.28, "soft");
        this.drawText(this.pinkTrombone.tract.length * 0.51, -0.28, "palate");
        this.drawText(this.pinkTrombone.tract.length * 0.77, -0.28, "hard");
        this.drawText(this.pinkTrombone.tract.length * 0.84, -0.28, "palate");
        this.drawText(this.pinkTrombone.tract.length * 0.95, -0.28, "lip");

        this.context.font = "17px Arial";
        this.drawTextStraight(this.pinkTrombone.tract.length * 0.18, 3, " tongue control");
        this.context.textAlign = "left";
        this.drawText(this.pinkTrombone.tract.length * 1.03, -1.07, "nasals");
        this.drawText(this.pinkTrombone.tract.length * 1.03, -0.28, "stops");
        this.drawText(this.pinkTrombone.tract.length * 1.03, 0.51, "fricatives");
        
        this.context.strokeStyle = "orchid";
        this.context.lineWidth = 2;
        this.context.beginPath();
        this.moveTo(this.pinkTrombone.tract.length * 1.03, 0);
            this.lineTo(this.pinkTrombone.tract.length * 1.07, 0);
        this.moveTo(this.pinkTrombone.tract.length * 1.03, -this.offset.nose);
            this.lineTo(this.pinkTrombone.tract.length * 1.07, -this.offset.nose);
        this.context.stroke();
        this.context.globalAlpha = 0.9;
        this.context.globalAlpha = 1.0;

        this.context = this.tractContext;
    }

    drawPositions() {
        this.context.fillStyle = "orchid";
        this.context.font = "24px Arial";
        this.context.textAlign = "center";
        this.context.globalAlpha = 0.6;
        
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
        this.context.globalAlpha = 0.8;

        this.drawText(38, approximants, 'l');
        this.drawText(41, approximants, 'w');

        this.drawText(4.5, 0.37, 'h');

        if(this.pinkTrombone.glottis.isTouched || this.pinkTrombone.alwaysVoice) {
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
    }

    drawAmplitudes() {
        this.context.strokeStyle = "orchid";
        this.context.lineCap = "butt";
        this.context.globalAlpha = 0.3;
        
        for(let index = 2; index < this.pinkTrombone.tract.length - 1; index++) {
            this.context.beginPath();
            this.context.lineWidth = Math.sqrt(this.pinkTrombone.tract.amplitude.max[index])*3;
            this.moveTo(index, 0);
            this.lineTo(index, this.pinkTrombone.tract.diameter[index]);
            this.context.stroke();
        }

        for(let index = 1; index < this.pinkTrombone.tract.nose.length - 1; index++) {
            this.context.beginPath();
            this.context.lineWidth = Math.sqrt(this.pinkTrombone.tract.nose.amplitude.max[index])*3;
            this.moveTo(index+this.pinkTrombone.tract.nose.start, -this.offset.nose);
            this.lineTo(index+this.pinkTrombone.tract.nose.start, -this.offset.nose - this.pinkTrombone.tract.nose.diameter[index]*0.9);
            this.context.stroke();
        }

        this.context.globalAlpha = 1;
    }

    drawTongueControl() {
        this.context.lineCap = this.context.lineJoin = "round";
        this.context.strokeStyle = this.context.fillStyle = TractUI.palePink;
        this.context.globalAlpha = 1.0;
        this.context.beginPath();
        this.context.lineWidth = 45;

        this.moveTo(this.tongue.indexBound.lower, this.tongue.controlRadius.inner);
        for(let index = this.tongue.indexBound.lower+1; index <= this.tongue.indexBound.upper; index++)
            this.lineTo(index, this.tongue.controlRadius.inner);
        this.lineTo(this.tongue.indexCenter, this.tongue.controlRadius.outer);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();

        const a = this.tongue.controlRadius.inner;
        const c = this.tongue.controlRadius.outer;
        const b = 0.5 * (a+c);
        const r = 3;

        this.context.fillStyle = "orchid";
        this.context.globalAlpha = 0.3;
        this.drawCircle(this.tongue.indexCenter, a, r);
        this.drawCircle(this.tongue.indexCenter - 4.25, a, r);
        this.drawCircle(this.tongue.indexCenter - 8.5, a, r);
        this.drawCircle(this.tongue.indexCenter + 4.25, a, r);
        this.drawCircle(this.tongue.indexCenter + 8.5, a, r);
        this.drawCircle(this.tongue.indexCenter - 6.1, b, r);
        this.drawCircle(this.tongue.indexCenter + 6.1, b, r);
        this.drawCircle(this.tongue.indexCenter, b, r);
        this.drawCircle(this.tongue.indexCenter, c, r);

        this.context.globalAlpha = 1.0;

        const angle = this.angle.offset + this.tongue.index * this.angle.scale * Math.PI / (this.pinkTrombone.tract.start.lip-1);
        const r2 = this.radius - this.scale*(this.tongue.diameter);
        const x = this.origin.x - r2 * Math.cos(angle);
        const y = this.origin.y - r2 * Math.sin(angle);
        
        this.context.lineWidth = 4;
        this.context.strokeStyle = "orchid";
        this.context.globalAlpha = 0.7;
        this.context.beginPath();
        this.context.arc(x , y, 18, 0, 2*Math.PI);
        this.context.stroke();
        this.context.globalAlpha = 0.15;
        this.context.fill();
        this.context.globalAlpha = 1.0;
        this.context.fillStyle = "orchid";
    }

    drawPitchControl() {
        const w = 9;
        const h = 15;

        if(this.pinkTrombone.glottis.x) {
            this.context.lineWidth = 4;
            this.context.strokeStyle = "orchid";
            this.context.globalAlpha = 0.7;
            this.context.beginPath();
            this.context.moveTo(this.pinkTrombone.glottis.x-w, this.pinkTrombone.glottis.y-h);
            this.context.lineTo(this.pinkTrombone.glottis.x+w, this.pinkTrombone.glottis.y-h);
            this.context.lineTo(this.pinkTrombone.glottis.x+w, this.pinkTrombone.glottis.y+h);
            this.context.lineTo(this.pinkTrombone.glottis.x-w, this.pinkTrombone.glottis.y+h);
            this.context.closePath();
            this.context.stroke();
            this.context.globalAlpha = 0.15;
            this.context.fill();
            this.context.globalAlpha = 1.0;
        }
    }

    setRestDiameter() {
        for(let index = this.pinkTrombone.tract.start.blade; index < this.pinkTrombone.tract.start.lip; index++) {
            const t = 1.1 * Math.PI * (this.tongue.index - index) / (this.pinkTrombone.tract.start.tip - this.pinkTrombone.tract.start.blade);
            const fixedTongueDiameter = 2 + (this.tongue.diameter - 2)/1.5;
            
            var curve = (1.5 - fixedTongueDiameter + this.offset.grid) * Math.cos(t);
            if(index == this.pinkTrombone.tract.start.blade-2 || index == this.pinkTrombone.tract.start.lip-1)
                curve *= 0.8;
            if(index == this.pinkTrombone.tract.start.blade || index == this.pinkTrombone.tract.start.lip - 2)
                curve *= 0.94;

            this.pinkTrombone.tract.diameter.rest[index] = 1.5 - curve;
        }
    }

    handleTouches(touches) {
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
            
                if(index >= this.tongue.indexBound.lower-4 && index <= this.tongue.indexBound.upper+4 && diameter >= this.tongue.controlRadius.inner-0.5 && diameter <= this.tongue.controlRadius.outer+0.5)
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
        for(let index = 0; index < this.pinkTrombone.tract.length; index++)
            this.pinkTrombone.tract.diameter.target[index] = this.pinkTrombone.tract.diameter.rest[index];
        
        this.pinkTrombone.tract.velum.target = 0.01;
        touches.forEach(touch => {
            if(!touch.alive)
                return;
            
            const x = touch.x;
            const y = touch.y;
            const index = this.getIndex(x, y);
            var diameter = this.getDiameter(x, y);
            
            if(index > this.pinkTrombone.tract.nose.start && diameter < -this.offset.nose)
                this.pinkTrombone.tract.velum.target = 0.4;
            
            this.temp.a = index;
            this.temp.b = diameter;

            if(diameter < -0.85 - this.offset.nose)
                return;
            
            diameter -= 0.3;

            if(diameter < 0)
                diameter = 0;
            
            var width = 2;
            if(index < 25)
                width = 10;
            else if(index >= this.pinkTrombone.tract.start.tip)
                width = 5;
            else
                width = 10 - 5 * (index-25) / (this.pinkTrombone.tract.start.tip-25);
            
            if(index >= 2 && index < this.pinkTrombone.tract.length && y < this.tractCanvas.height && diameter < 3) {
                const intIndex = Math.round(index);
                for(let _index = -Math.ceil(width)-1; _index < width+1; _index++) {
                    if(intIndex + _index < 0 || intIndex + _index >= this.pinkTrombone.tract.length)
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
                 
                    if(diameter < this.pinkTrombone.tract.diameter.target[intIndex + _index])
                        this.pinkTrombone.tract.diameter.target[intIndex + _index] = diameter + (this.pinkTrombone.tract.diameter.target[intIndex + _index] - diameter) * shrink;
                }
            }
         });

         // SET
    }
}

export default TractUI;