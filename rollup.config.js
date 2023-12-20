const builds = [
    {
        input: "script/component.js",
        output: [
            {
                format: "esm",
                file: "pink-trombone.min.js",
            },
        ],
    },
    {
        input: "script/audio/nodes/pinkTrombone/processors/WorkletProcessor.js",
        output: [
            {
                format: "esm",
                file: "pink-trombone-worklet-processor.min.js",
            },
        ],
    },
];

export default (args) => builds;
