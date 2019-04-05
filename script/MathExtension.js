Object.assign(Math, {
    clamp : function(input, min = input, max = input) {
        var output = input;

        if(output < min)
            output = min;
        else if(output > max)
            output = max;
        
        return output;
    },
    interpolate : function(interpolation, from, to) {
        interpolation = Math.clamp(interpolation, 0, 1);
        const weight = {
            from : (1 - interpolation),
            to : interpolation,
        };
        return (from * weight.from) + (to * weight.to);
    },
    // this is like interpolation...but additive...
    moveTowards : function(current, target, amountUp, amountDown) {
        return (current < target)?
            Math.min(current + amountUp, target) :
            Math.max(current-amountDown, target) ;
    }
})

export default Math;