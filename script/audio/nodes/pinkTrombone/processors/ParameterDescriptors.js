const ParameterDescriptors = [
  {
    name: "noise",
    defaultValue: 0,
    minValue: -1,
    maxValue: 1,
  },
  {
    name: "frequency",
    defaultValue: 140,
    minValue: 0,
  },
  {
    name: "tenseness",
    defaultValue: 0.6,
    minValue: 0,
    maxValue: 1,
  },
  {
    name: "intensity",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },
  {
    name: "loudness",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },

  {
    name: "tongueIndex",
    defaultValue: 12.9,
    //automationRate : "k-rate",
  },
  {
    name: "tongueDiameter",
    defaultValue: 2.43,
    //automationRate : "k-rate",
  },

  {
    name: "vibratoWobble",
    defaultValue: 1,
    minValue: 0,
    maxValue: 1,
  },

  {
    name: "vibratoFrequency",
    defaultValue: 6,
    minValue: 0,
  },
  {
    name: "vibratoGain",
    defaultValue: 0.005,
    minValue: 0,
  },

  {
    name: "tractLength",
    defaultValue: 44,
    minValue: 15,
    maxValue: 88,
  },
];

ParameterDescriptors.numberOfConstrictions = 4;

for (
  let index = 0;
  index < ParameterDescriptors.numberOfConstrictions;
  index++
) {
  const constrictionParameterDescriptors = [
    {
      name: "constriction" + index + "index",
      defaultValue: 0,
      //automationRate: "k-rate",
    },
    {
      name: "constriction" + index + "diameter",
      defaultValue: 0,
      //automationRate: "k-rate",
    },
  ];

  ParameterDescriptors.push(...constrictionParameterDescriptors);
}

export default ParameterDescriptors;
