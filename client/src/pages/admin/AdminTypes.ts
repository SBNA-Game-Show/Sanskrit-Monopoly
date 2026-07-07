export interface PopQuizActivity {
  id: string;
  question: string;
  options: string[];      
  correctAnswer: string;  
}

export interface MonopolyTile {
  id: string;
  name: string;
  type: "property" | "railroad" | "utility" | "tax" | "jail" | "goToJail" | "chance" | "community" | "minigame" | "quiz";
  money: number; 
  price?: number;
  rent?: number;
  sellValue?: number;
  group?: "red" | "brown" | "lightBlue" | "pink" | "orange" | "yellow" | "green" | "darkBlue" | "railroad" | "utility" | "" ;
}

export interface GameEdition {
  id: string;
  name: string;
  tiles: MonopolyTile[];              
  activities?: PopQuizActivity[]; 
}