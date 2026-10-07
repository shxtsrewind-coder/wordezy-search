// Themed word banks. Each theme needs enough words (24+) that a daily pick
// rarely repeats the same combination for months, and a wide length range
// (3-12 letters) so a puzzle mixes quick finds with a few real stretches.
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
      "FOX", "OWL", "TIGER", "ZEBRA", "OTTER", "EAGLE", "CAMEL", "RABBIT", "DOLPHIN", "PANTHER",
      "FALCON", "BEAVER", "GIRAFFE", "LEOPARD", "SQUIRREL", "PENGUIN", "GORILLA",
      "CHEETAH", "BADGER", "HERON", "WALRUS", "COYOTE", "PLATYPUS", "ARMADILLO",
      "HEDGEHOG", "CHIMPANZEE", "RHINOCEROS",
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    words: [
      "POT", "SPOON", "WHISK", "KETTLE", "LADLE", "SKILLET", "BLENDER", "TOASTER",
      "PLATTER", "COLANDER", "SPATULA", "GRIDDLE", "TONGS", "GRATER", "OVEN",
      "KNIFE", "CUTTING", "PANTRY", "BURNER", "APRON", "TRIVET", "CASSEROLE",
      "SAUCEPAN", "DISHWASHER", "REFRIGERATOR",
    ],
  },
  {
    id: "weather",
    label: "Weather",
    words: [
      "FOG", "HAIL", "MIST", "STORM", "BREEZE", "DROUGHT", "THUNDER", "RAINBOW", "BLIZZARD", "HUMID",
      "FROST", "CYCLONE", "SUNSHINE", "DRIZZLE", "MONSOON", "OVERCAST", "GALE",
      "TORNADO", "CLIMATE", "FORECAST", "SLEET", "HURRICANE", "TEMPERATURE",
      "PRECIPITATION", "THUNDERSTORM",
    ],
  },
  {
    id: "space",
    label: "Space",
    words: [
      "SUN", "STAR", "COMET", "GALAXY", "METEOR", "NEBULA", "ORBIT", "ROCKET", "SATURN",
      "ASTEROID", "ECLIPSE", "GRAVITY", "SHUTTLE", "TELESCOPE", "COSMOS",
      "LUNAR", "QUASAR", "PULSAR", "STARDUST", "VOYAGER", "CRATER", "SOLAR",
      "ASTRONAUT", "SATELLITE", "CONSTELLATION", "ATMOSPHERE",
    ],
  },
  {
    id: "music",
    label: "Music",
    words: [
      "BEAT", "SONG", "MELODY", "RHYTHM", "TEMPO", "CHORUS", "BALLAD", "VIOLIN", "TRUMPET",
      "CLARINET", "HARMONY", "ORCHESTRA", "CADENCE", "ENCORE", "BASSLINE",
      "DRUMKIT", "LYRICS", "OCTAVE", "SONATA", "TUNING", "VINYL", "CHOIR",
      "SYMPHONY", "ACCORDION", "SAXOPHONE", "PERCUSSION",
    ],
  },
  {
    id: "garden",
    label: "Garden",
    words: [
      "VINE", "BLOOM", "SOIL", "BLOSSOM", "COMPOST", "TRELLIS", "SPROUT", "ORCHARD", "PERGOLA", "SHOVEL",
      "NURSERY", "PETUNIA", "LAVENDER", "MULCH", "GREENHOUSE", "HEDGE",
      "WATERING", "SEEDLING", "TERRACE", "PRUNING", "SUNFLOWER",
      "WHEELBARROW", "IRRIGATION", "HORTICULTURE",
    ],
  },
  {
    id: "ocean",
    label: "Ocean",
    words: [
      "WAVE", "REEF", "TIDE", "CORAL", "ANCHOR", "LAGOON", "HARBOR", "DOLPHIN", "CURRENT",
      "PLANKTON", "STARFISH", "SEAHORSE", "JELLYFISH", "LIGHTHOUSE", "SHIPWRECK",
      "SUBMARINE", "SEAWEED", "DRIFTWOOD", "HORIZON", "SHORELINE", "ESTUARY",
      "OCTOPUS", "BARNACLE", "UNDERWATER",
    ],
  },
  {
    id: "sports",
    label: "Sports",
    words: [
      "GOAL", "RACE", "TEAM", "COACH", "STADIUM", "REFEREE", "DEFENSE", "OFFENSE", "TROPHY",
      "SPRINT", "HURDLE", "DRIBBLE", "TACKLE", "VOLLEYBALL", "BASKETBALL",
      "GYMNASTICS", "MARATHON", "CHAMPION", "SCOREBOARD", "TOURNAMENT",
      "GOALKEEPER", "QUARTERBACK", "SCRIMMAGE",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    words: [
      "MAP", "VISA", "TRAIN", "TICKET", "AIRPORT", "LUGGAGE", "PASSPORT", "VOYAGE",
      "COMPASS", "ITINERARY", "SOUVENIR", "HOSTEL", "LAYOVER", "CUSTOMS",
      "BACKPACK", "DESTINATION", "EXCURSION", "LANDMARK", "WANDERLUST",
      "EXPEDITION", "CARAVAN", "CRUISE", "TIMEZONE",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    words: [
      "APP", "CODE", "CHIP", "CLOUD", "ROUTER", "SERVER", "BATTERY", "KEYBOARD", "SOFTWARE",
      "HARDWARE", "BLUETOOTH", "ALGORITHM", "DOWNLOAD", "FIREWALL", "INTERFACE",
      "BANDWIDTH", "PROCESSOR", "ENCRYPTION", "BROWSER", "NETWORK",
      "MICROCHIP", "ARTIFICIAL", "PROGRAMMING",
    ],
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
