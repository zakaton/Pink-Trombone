/*
    TODO
        .type property that allows for different noise types (white noise, pink noise, etc)
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

window.AudioContext.prototype.createNoise = function() {
    const noiseNode = this.createBufferSource();

    const seconds = 1;

    const buffer = this.createBuffer(1, seconds*this.sampleRate, this.sampleRate);
    const bufferChannel = buffer.getChannelData(0);
    for(let sampleIndex = 0; sampleIndex < bufferChannel.length; sampleIndex++)
        bufferChannel[sampleIndex] = ((Math.random(0) *2) -1);

    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseNode.start();
    
    return noiseNode;
}

export {};