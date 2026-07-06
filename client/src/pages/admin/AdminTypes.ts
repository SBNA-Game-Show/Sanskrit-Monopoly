export interface PopQuizActivity {
  id: string;
  question: string;
  options: string[];      
  correctAnswer: string;  
}

export interface MonopolyTile {
  id: string;
  name: string;
  type: "property" | "tax" | "jail" | "goToJail" | "chance" | "community" | "minigame" | "quiz";
  points: number; 
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