/*
    TODO
        create a ScriptProcessorNode with an .offset.value property
        output the .offset.value
        add .linearRamp, .exponentialRamp, etc
        .connect adds to the .offset.value
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if(window.AudioContext.prototype.createConstantSource == undefined) {
    window.AudioContext.prototype.createConstantSource = function() {
        // FILL
    }
}

export {};