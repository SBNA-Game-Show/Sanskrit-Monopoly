import boatImg from "../../assets/monopoly_boat.png";
import catImg from "../../assets/monopoly_cat.png";
import shoeImg from "../../assets/monopoly_shoe.png";
import dogImg from "../../assets/monopoly_dog.png";

export const TOKEN_OPTIONS = [
  { id: "boat", src: boatImg, label: "Boat" },
  { id: "cat", src: catImg, label: "Cat" },
  { id: "shoe", src: shoeImg, label: "Shoe" },
  { id: "dog", src: dogImg, label: "Dog" },
] as const;

export type TokenId = (typeof TOKEN_OPTIONS)[number]["id"];

export const TOKEN_IMAGE_BY_ID: Record<string, string> = Object.fromEntries(
  TOKEN_OPTIONS.map((token) => [token.id, token.src]),
);
