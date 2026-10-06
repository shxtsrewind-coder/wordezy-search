// Themed word banks. Each theme needs enough words (15+) that a daily pick
// of 8-10 rarely repeats the same combination for months. Keep entries
// 3-9 letters — long enough to be satisfying to find, short enough to fit a
// reasonably sized grid.
export interface Theme {
  id: string;
  label: string;
  words: string[];
}

export const THEMES: Theme[] = [
  {
    id: "animals",
    label: "Animals",
    words: [
      "TIGER", "ZEBRA", "OTTER", "EAGLE", "CAMEL", "RABBIT", "DOLPHIN", "PANTHER",
      "FALCON", "BEAVER", "GIRAFFE", "LEOPARD", "SQUIRREL", "PENGUIN", "GORILLA",
      "CHEETAH", "BADGER", "HERON", "WALRUS", "COYOTE",
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    words: [
      "SPOON", "WHISK", "KETTLE", "SKILLET", "LADLE", "BLENDER", "TOASTER",
      "PLATTER", "COLANDER", "SPATULA", "GRIDDLE", "TONGS", "GRATER", "OVEN",
      "KNIFE", "CUTTING", "PANTRY", "BURNER", "APRON", "TRIVET",
    ],
  },
  {
    id: "weather",
    label: "Weather",
    words: [
      "STORM", "BREEZE", "DROUGHT", "THUNDER", "RAINBOW", "BLIZZARD", "HUMID",
      "FROST", "CYCLONE", "SUNSHINE", "DRIZZLE", "MONSOON", "OVERCAST", "GALE",
      "HAIL", "MIST", "TORNADO", "CLIMATE", "FORECAST", "SLEET",
    ],
  },
  {
    id: "space",
    label: "Space",
    words: [
      "COMET", "GALAXY", "METEOR", "NEBULA", "ORBIT", "ROCKET", "SATURN",
      "ASTEROID", "ECLIPSE", "GRAVITY", "SHUTTLE", "TELESCOPE", "COSMOS",
      "LUNAR", "QUASAR", "PULSAR", "STARDUST", "VOYAGER", "CRATER", "SOLAR",
    ],
  },
  {
    id: "music",
    label: "Music",
    words: [
      "MELODY", "RHYTHM", "TEMPO", "CHORUS", "BALLAD", "VIOLIN", "TRUMPET",
      "CLARINET", "HARMONY", "ORCHESTRA", "CADENCE", "ENCORE", "BASSLINE",
      "DRUMKIT", "LYRICS", "OCTAVE", "SONATA", "TUNING", "VINYL", "CHOIR",
    ],
  },
  {
    id: "garden",
    label: "Garden",
    words: [
      "BLOSSOM", "COMPOST", "TRELLIS", "SPROUT", "ORCHARD", "PERGOLA", "SHOVEL",
      "NURSERY", "PETUNIA", "LAVENDER", "MULCH", "GREENHOUSE", "HEDGE",
      "WATERING", "SEEDLING", "TERRACE", "BLOOM", "PRUNING", "SUNFLOWER", "VINE",
    ],
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
