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
      "GOALKEEPER", "QUARTERBACK", "SCRIMMAGE", "UMPIRE", "RELAY",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    words: [
      "MAP", "VISA", "TRAIN", "TICKET", "AIRPORT", "LUGGAGE", "PASSPORT", "VOYAGE",
      "COMPASS", "ITINERARY", "SOUVENIR", "HOSTEL", "LAYOVER", "CUSTOMS",
      "BACKPACK", "DESTINATION", "EXCURSION", "LANDMARK", "WANDERLUST",
      "EXPEDITION", "CARAVAN", "CRUISE", "TIMEZONE", "TOURIST", "SHUTTLE",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    words: [
      "APP", "CODE", "CHIP", "CLOUD", "ROUTER", "SERVER", "BATTERY", "KEYBOARD", "SOFTWARE",
      "HARDWARE", "BLUETOOTH", "ALGORITHM", "DOWNLOAD", "FIREWALL", "INTERFACE",
      "BANDWIDTH", "PROCESSOR", "ENCRYPTION", "BROWSER", "NETWORK",
      "MICROCHIP", "ARTIFICIAL", "PROGRAMMING", "WEBSITE", "GADGET",
    ],
  },
  {
    id: "geography",
    label: "Geography",
    words: [
      "BAY", "LAKE", "GULF", "DUNE", "CAVE", "REEF", "OASIS", "DELTA", "CANYON",
      "GLACIER", "VOLCANO", "TUNDRA", "PLATEAU", "PRAIRIE", "SAVANNA", "ISTHMUS",
      "FJORD", "STRAIT", "BASIN", "VALLEY", "PENINSULA", "EQUATOR", "CONTINENT",
      "LONGITUDE", "LATITUDE", "HEMISPHERE", "ARCHIPELAGO", "TOPOGRAPHY",
    ],
  },
  {
    id: "countries",
    label: "Countries",
    words: [
      "CHAD", "CUBA", "PERU", "CHILE", "INDIA", "CHINA", "EGYPT", "KENYA", "JAPAN",
      "FRANCE", "BRAZIL", "CANADA", "MEXICO", "NORWAY", "GREECE", "POLAND", "SWEDEN",
      "NIGERIA", "ARGENTINA", "AUSTRALIA", "THAILAND", "PORTUGAL", "COLOMBIA",
      "VIETNAM", "MOROCCO", "ICELAND", "INDONESIA", "PHILIPPINES", "SWITZERLAND", "KAZAKHSTAN",
    ],
  },
  {
    id: "places",
    label: "Cities & Places",
    words: [
      "LAGOS", "CAIRO", "PARIS", "TOKYO", "DUBAI", "DELHI", "ACCRA", "ROME", "SEOUL",
      "LONDON", "BERLIN", "SYDNEY", "MUMBAI", "VENICE", "ATHENS", "MOSCOW", "NAIROBI",
      "TORONTO", "ISTANBUL", "BARCELONA", "SINGAPORE", "AMSTERDAM", "JERUSALEM",
      "STOCKHOLM", "HELSINKI", "MELBOURNE", "JOHANNESBURG",
    ],
  },
  {
    id: "history",
    label: "History",
    words: [
      "WAR", "FORT", "RELIC", "SIEGE", "EMPIRE", "TREATY", "COLONY", "SCROLL", "ANCIENT",
      "DYNASTY", "MONARCH", "PHARAOH", "ARTIFACT", "CRUSADE", "CONQUEST", "ARCHIVE",
      "MEDIEVAL", "MONUMENT", "GLADIATOR", "CHRONICLE", "FEUDALISM", "REVOLUTION",
      "MANUSCRIPT", "EXCAVATION", "ARCHAEOLOGY", "RENAISSANCE", "CIVILIZATION", "INDEPENDENCE",
    ],
  },
  {
    id: "health",
    label: "Health & Safety",
    words: [
      "GYM", "REST", "SAFETY", "HELMET", "VACCINE", "HYGIENE", "BANDAGE", "CHECKUP",
      "ALLERGY", "FIRSTAID", "SEATBELT", "WELLNESS", "IMMUNITY", "PHYSICIAN", "AMBULANCE",
      "EMERGENCY", "HYDRATION", "NUTRITION", "SANITIZER", "STRETCHING", "QUARANTINE",
      "PRECAUTION", "EVACUATION", "VENTILATION", "STETHOSCOPE", "RESUSCITATION",
    ],
  },
  {
    id: "books",
    label: "Books",
    words: [
      "PLOT", "GENRE", "QUOTE", "EDITOR", "NOVEL", "SEQUEL", "AUTHOR", "CHAPTER", "LIBRARY",
      "FICTION", "PROLOGUE", "EPILOGUE", "PUBLISHER", "BOOKWORM", "NARRATOR", "FOOTNOTE",
      "GLOSSARY", "HARDCOVER", "PAPERBACK", "CHARACTER", "BIOGRAPHY", "BOOKSHELF",
      "PSEUDONYM", "ANTHOLOGY", "BESTSELLER", "LITERATURE",
    ],
  },
  {
    id: "synonyms",
    label: "Synonyms",
    words: [
      "GLAD", "HUGE", "BOLD", "WISE", "RAPID", "SWIFT", "QUICK", "MERRY", "GIANT",
      "CLEVER", "ELATED", "BRIGHT", "GLOOMY", "SPEEDY", "DARING", "JOYFUL", "IMMENSE",
      "MASSIVE", "CHEERFUL", "FEARLESS", "UNHAPPY", "DOWNCAST", "BRILLIANT", "ENORMOUS",
      "SORROWFUL", "COURAGEOUS",
    ],
  },
  {
    id: "religious",
    label: "Religious",
    words: [
      "MONK", "HYMN", "FAITH", "PRAYER", "TEMPLE", "CHURCH", "MOSQUE", "SHRINE", "SACRED",
      "RITUAL", "SERMON", "PROPHET", "PILGRIM", "WORSHIP", "DEVOTION", "BLESSING",
      "CEREMONY", "DISCIPLE", "FESTIVAL", "SANCTUARY", "SCRIPTURE", "SYNAGOGUE",
      "MEDITATION", "PILGRIMAGE", "COMMANDMENT", "CONGREGATION",
    ],
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    words: [
      "KEEN", "WARY", "LUCID", "CANDID", "SUBTLE", "FRUGAL", "ZEALOUS", "INNATE",
      "TENACIOUS", "RESILIENT", "AMBIGUOUS", "METICULOUS", "PRAGMATIC", "PLAUSIBLE",
      "ELOQUENT", "AUTHENTIC", "PROFOUND", "VERSATILE", "INTRICATE", "DILIGENT",
      "CREDIBLE", "SINCERE", "OPTIMISTIC", "CURIOUS", "VERBOSE", "EPHEMERAL",
    ],
  },
  {
    id: "educational",
    label: "Educational",
    words: [
      "MATH", "EXAM", "ESSAY", "PHYSICS", "SCIENCE", "BIOLOGY", "GRAMMAR", "ALGEBRA",
      "LECTURE", "SCHOLAR", "DIPLOMA", "TUITION", "CHEMISTRY", "TUTORIAL", "HOMEWORK",
      "SEMESTER", "TEXTBOOK", "PROFESSOR", "PRESCHOOL", "CLASSROOM", "GRADUATION",
      "CURRICULUM", "UNIVERSITY", "SCHOLARSHIP", "KINDERGARTEN",
    ],
  },
  {
    id: "seasonal",
    label: "Seasonal",
    words: [
      "FALL", "SNOW", "SPRING", "SUMMER", "AUTUMN", "WINTER", "EASTER", "FROSTY",
      "FESTIVE", "HARVEST", "PUMPKIN", "HOLIDAY", "FOLIAGE", "EQUINOX", "SOLSTICE",
      "CARNIVAL", "SNOWFALL", "HIBERNATE", "MIGRATION", "FIREWORKS", "EVERGREEN",
      "CHRISTMAS", "HALLOWEEN", "VALENTINE", "THANKSGIVING",
    ],
  },
  {
    id: "nonenglish",
    label: "Non-English",
    words: [
      "TACO", "YOGA", "GURU", "SUSHI", "PASTA", "SAFARI", "FIESTA", "SIESTA", "KARMA",
      "SAUNA", "VODKA", "BALLET", "ORIGAMI", "KARAOKE", "TSUNAMI", "KIMONO", "NIRVANA",
      "TYCOON", "KETCHUP", "SHAMPOO", "PAJAMAS", "BUNGALOW", "VERANDA", "AVOCADO",
      "GRAFFITI", "ESPRESSO", "LASAGNA", "BURRITO", "TORTILLA", "CROISSANT", "SOUVENIR", "RENDEZVOUS",
    ],
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
