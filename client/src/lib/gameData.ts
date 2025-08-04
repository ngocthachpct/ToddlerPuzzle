export interface GameItem {
  id: string;
  name: string;
  image: string;
  shadow: string;
}

export const gameData = {
  animals: [
    {
      id: "cat",
      name: "Cat",
      image: "/src/assets/animals/cat.svg",
      shadow: "/src/assets/shadows/cat_shadow.svg"
    },
    {
      id: "dog", 
      name: "Dog",
      image: "/src/assets/animals/dog.svg",
      shadow: "/src/assets/shadows/dog_shadow.svg"
    },
    {
      id: "rabbit",
      name: "Rabbit", 
      image: "/src/assets/animals/rabbit.svg",
      shadow: "/src/assets/shadows/rabbit_shadow.svg"
    }
  ]
};
