import dice1 from "../../assets/dice/dice-1.png";
import dice2 from "../../assets/dice/dice-2.png";
import dice3 from "../../assets/dice/dice-3.png";
import dice4 from "../../assets/dice/dice-4.png";
import dice5 from "../../assets/dice/dice-5.png";
import dice6 from "../../assets/dice/dice-6.png";

// index 0 = face 1, index 5 = face 6
export const DICE_FACE_URLS = [dice1, dice2, dice3, dice4, dice5, dice6] as const;

export function getDiceFaceUrl(value: number): string {
  return DICE_FACE_URLS[Math.max(1, Math.min(6, value)) - 1];
}