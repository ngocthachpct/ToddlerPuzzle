export interface GameItem {
  id: string;
  name: string;
  image: string;
  shadow: string;
}

export interface GameTopic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  items: GameItem[];
}

const createGameItem = (id: string, name: string, folder: string): GameItem => ({
  id,
  name,
  image: `/src/assets/${folder}/${id}.png`,
  shadow: `/src/assets/${folder}/shadows/${id}.png`
});

export const gameTopics: GameTopic[] = [
  {
    id: "domestic-animals",
    name: "Domestic Animals",
    emoji: "🐶",
    description: "Farm and pet animals",
    items: [
      createGameItem("cat", "Cat", "domestic-animals"),
      createGameItem("dog", "Dog", "domestic-animals"),
      createGameItem("chicken", "Chicken", "animals"),
      createGameItem("duck", "Duck", "animals"),
      createGameItem("rabbit", "Rabbit", "animals"),
      createGameItem("pig", "Pig", "animals"),
      createGameItem("cow", "Cow", "animals"),
      createGameItem("goat", "Goat", "animals"),
      createGameItem("horse", "Horse", "animals"),
      createGameItem("fish", "Fish", "animals")
    ]
  },
  {
    id: "wild-animals",
    name: "Wild Animals",
    emoji: "🐯",
    description: "Animals from the wild",
    items: [
      createGameItem("lion", "Lion", "wild-animals"),
      createGameItem("elephant", "Elephant", "wild-animals"),
      createGameItem("tiger", "Tiger", "wild-animals"),
      createGameItem("monkey", "Monkey", "wild-animals"),
      createGameItem("bear", "Bear", "wild-animals"),
      createGameItem("giraffe", "Giraffe", "wild-animals"),
      createGameItem("zebra", "Zebra", "wild-animals"),
      createGameItem("crocodile", "Crocodile", "wild-animals"),
      createGameItem("hippo", "Hippo", "wild-animals"),
      createGameItem("snake", "Snake", "wild-animals")
    ]
  },
  {
    id: "insects",
    name: "Insects",
    emoji: "🦋",
    description: "Bugs and small creatures",
    items: [
      createGameItem("butterfly", "Butterfly", "insects"),
      createGameItem("bee", "Bee", "insects"),
      createGameItem("ladybug", "Ladybug", "insects"),
      createGameItem("ant", "Ant", "insects"),
      createGameItem("dragonfly", "Dragonfly", "insects"),
      createGameItem("grasshopper", "Grasshopper", "insects"),
      createGameItem("spider", "Spider", "insects"),
      createGameItem("caterpillar", "Caterpillar", "insects"),
      createGameItem("snail", "Snail", "insects"),
      createGameItem("fly", "Fly", "insects")
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles",
    emoji: "🚗",
    description: "Cars, trains, and more",
    items: [
      createGameItem("car", "Car", "vehicles"),
      createGameItem("bus", "Bus", "vehicles"),
      createGameItem("fire-truck", "Fire Truck", "vehicles"),
      createGameItem("police-car", "Police Car", "vehicles"),
      createGameItem("train", "Train", "vehicles"),
      createGameItem("airplane", "Airplane", "vehicles"),
      createGameItem("helicopter", "Helicopter", "vehicles"),
      createGameItem("boat", "Boat", "vehicles"),
      createGameItem("bicycle", "Bicycle", "vehicles"),
      createGameItem("scooter", "Scooter", "vehicles")
    ]
  },
  {
    id: "fruits",
    name: "Fruits",
    emoji: "🍎",
    description: "Delicious and healthy fruits",
    items: [
      createGameItem("apple", "Apple", "fruits"),
      createGameItem("banana", "Banana", "fruits"),
      createGameItem("orange", "Orange", "fruits"),
      createGameItem("watermelon", "Watermelon", "fruits"),
      createGameItem("grapes", "Grapes", "fruits"),
      createGameItem("strawberry", "Strawberry", "fruits"),
      createGameItem("pineapple", "Pineapple", "fruits"),
      createGameItem("mango", "Mango", "fruits"),
      createGameItem("pear", "Pear", "fruits"),
      createGameItem("cherry", "Cherry", "fruits")
    ]
  },
  {
    id: "food",
    name: "Food",
    emoji: "🍰",
    description: "Yummy foods and treats",
    items: [
      createGameItem("cake", "Cake", "food"),
      createGameItem("ice-cream", "Ice Cream", "food"),
      createGameItem("pizza", "Pizza", "food"),
      createGameItem("sandwich", "Sandwich", "food"),
      createGameItem("cookie", "Cookie", "food"),
      createGameItem("hot-dog", "Hot Dog", "food"),
      createGameItem("hamburger", "Hamburger", "food"),
      createGameItem("cheese", "Cheese", "food"),
      createGameItem("bread", "Bread", "food"),
      createGameItem("milk", "Milk", "food")
    ]
  },
  {
    id: "toys",
    name: "Toys",
    emoji: "🎈",
    description: "Fun toys to play with",
    items: [
      createGameItem("teddy-bear", "Teddy Bear", "toys"),
      createGameItem("ball", "Ball", "toys"),
      createGameItem("toy-car", "Toy Car", "toys"),
      createGameItem("doll", "Doll", "toys"),
      createGameItem("puzzle-piece", "Puzzle Piece", "toys"),
      createGameItem("xylophone", "Xylophone", "toys"),
      createGameItem("stacking-rings", "Stacking Rings", "toys"),
      createGameItem("toy-drum", "Toy Drum", "toys"),
      createGameItem("toy-train", "Toy Train", "toys"),
      createGameItem("toy-blocks", "Toy Blocks", "toys")
    ]
  },
  {
    id: "clothes",
    name: "Clothes",
    emoji: "👕",
    description: "Things we wear",
    items: [
      createGameItem("shirt", "Shirt", "clothes"),
      createGameItem("pants", "Pants", "clothes"),
      createGameItem("dress", "Dress", "clothes"),
      createGameItem("hat", "Hat", "clothes"),
      createGameItem("shoes", "Shoes", "clothes"),
      createGameItem("socks", "Socks", "clothes"),
      createGameItem("jacket", "Jacket", "clothes"),
      createGameItem("scarf", "Scarf", "clothes"),
      createGameItem("gloves", "Gloves", "clothes"),
      createGameItem("shorts", "Shorts", "clothes")
    ]
  },
  {
    id: "school-supplies",
    name: "School Supplies",
    emoji: "📚",
    description: "Things for learning",
    items: [
      createGameItem("book", "Book", "school"),
      createGameItem("pencil", "Pencil", "school"),
      createGameItem("eraser", "Eraser", "school"),
      createGameItem("ruler", "Ruler", "school"),
      createGameItem("crayon", "Crayon", "school"),
      createGameItem("paintbrush", "Paintbrush", "school"),
      createGameItem("notebook", "Notebook", "school"),
      createGameItem("scissors", "Scissors", "school"),
      createGameItem("school-bag", "School Bag", "school"),
      createGameItem("glue-stick", "Glue Stick", "school")
    ]
  },
  {
    id: "shapes",
    name: "Basic Shapes",
    emoji: "🔵",
    description: "Learn about shapes",
    items: [
      createGameItem("circle", "Circle", "shapes"),
      createGameItem("square", "Square", "shapes"),
      createGameItem("triangle", "Triangle", "shapes"),
      createGameItem("rectangle", "Rectangle", "shapes"),
      createGameItem("star", "Star", "shapes"),
      createGameItem("heart", "Heart", "shapes"),
      createGameItem("oval", "Oval", "shapes"),
      createGameItem("diamond", "Diamond", "shapes"),
      createGameItem("pentagon", "Pentagon", "shapes"),
      createGameItem("hexagon", "Hexagon", "shapes")
    ]
  },
  {
    id: "colors",
    name: "Colors",
    emoji: "🌈",
    description: "Beautiful colors",
    items: [
      createGameItem("red", "Red", "colors"),
      createGameItem("blue", "Blue", "colors"),
      createGameItem("yellow", "Yellow", "colors"),
      createGameItem("green", "Green", "colors"),
      createGameItem("orange", "Orange", "colors"),
      createGameItem("purple", "Purple", "colors"),
      createGameItem("pink", "Pink", "colors"),
      createGameItem("brown", "Brown", "colors"),
      createGameItem("black", "Black", "colors"),
      createGameItem("white", "White", "colors")
    ]
  },
  {
    id: "plants",
    name: "Plants & Flowers",
    emoji: "🪴",
    description: "Beautiful plants and flowers",
    items: [
      createGameItem("rose", "Rose", "plants"),
      createGameItem("sunflower", "Sunflower", "plants"),
      createGameItem("tulip", "Tulip", "plants"),
      createGameItem("daisy", "Daisy", "plants"),
      createGameItem("cactus", "Cactus", "plants"),
      createGameItem("palm-tree", "Palm Tree", "plants"),
      createGameItem("tree", "Tree", "plants"),
      createGameItem("bush", "Bush", "plants"),
      createGameItem("potted-plant", "Potted Plant", "plants"),
      createGameItem("bamboo", "Bamboo", "plants")
    ]
  },
  {
    id: "household",
    name: "Household Items",
    emoji: "🧽",
    description: "Things around the house",
    items: [
      createGameItem("chair", "Chair", "household"),
      createGameItem("table", "Table", "household"),
      createGameItem("bed", "Bed", "household"),
      createGameItem("lamp", "Lamp", "household"),
      createGameItem("fan", "Fan", "household"),
      createGameItem("tv", "TV", "household"),
      createGameItem("mirror", "Mirror", "household"),
      createGameItem("clock", "Clock", "household"),
      createGameItem("shelf", "Shelf", "household"),
      createGameItem("cabinet", "Cabinet", "household")
    ]
  },
  {
    id: "weather",
    name: "Weather",
    emoji: "🌞",
    description: "Weather and sky",
    items: [
      createGameItem("sun", "Sun", "weather"),
      createGameItem("cloud", "Cloud", "weather"),
      createGameItem("rain", "Rain", "weather"),
      createGameItem("rainbow", "Rainbow", "weather"),
      createGameItem("snowflake", "Snowflake", "weather"),
      createGameItem("lightning", "Lightning", "weather"),
      createGameItem("umbrella", "Umbrella", "weather"),
      createGameItem("wind", "Wind", "weather"),
      createGameItem("thermometer", "Thermometer", "weather"),
      createGameItem("moon", "Moon", "weather")
    ]
  },
  {
    id: "expressions",
    name: "Facial Expressions",
    emoji: "😊",
    description: "How we feel",
    items: [
      createGameItem("happy", "Happy", "expressions"),
      createGameItem("sad", "Sad", "expressions"),
      createGameItem("angry", "Angry", "expressions"),
      createGameItem("surprised", "Surprised", "expressions"),
      createGameItem("scared", "Scared", "expressions"),
      createGameItem("tired", "Tired", "expressions"),
      createGameItem("confused", "Confused", "expressions"),
      createGameItem("excited", "Excited", "expressions"),
      createGameItem("crying", "Crying", "expressions"),
      createGameItem("laughing", "Laughing", "expressions")
    ]
  }
];

// Backwards compatibility
export const gameData = {
  animals: gameTopics[0].items
};
