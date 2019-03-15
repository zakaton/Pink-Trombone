class Button {
    constructor(x, y, width, height, text, switchedOn) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.switchedOn = switchedOn;
    }

    static get palePink() {
        return "#FFEEF5";
    }
    
    draw(context) {
        const radius = 10;
            context.strokeStyle = Button.palePink;
            context.fillStyle = Button.palePink;
            context.globalAlpha = 1.0;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.lineWidth = 2*radius;
            context.beginPath();
            context.moveTo(this.x+radius, this.y+radius);
            context.lineTo(this.x+this.width-radius, this.y+radius);
            context.lineTo(this.x+this.width-radius, this.y+this.height-radius);
            context.lineTo(this.x+radius, this.y+this.height-radius);
            context.closePath();
            context.stroke();
            context.fill();
        
        context.font="16px Arial";
        context.textAlign = "center";
        
        if (this.switchedOn)
        {
            context.fillStyle = "orchid";
            context.globalAlpha = 0.6;
        }
        else
        {
            context.fillStyle = "white";
            context.globalAlpha = 1.0;
        }
        this.drawText(context);
    }

    drawText(context) {
        context.fillText(this.text, this.x + this.width/2, this.y + this.height / 2+6);
    }
    
    handleTouchStart(touch) {
        if (touch.x>=this.x && touch.x <= this.x + this.width && touch.y >= this.y && touch.y <= this.y + this.height)
            this.switchedOn = !this.switchedOn;
    }
}

export default Button;