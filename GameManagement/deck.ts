const numbers = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "skip",
  "reverse",
  "plus_two",
  "plus_four",
  "joker",
];
const colors = ["red", "yellow", "green", "blue"];

export function createDeck() {
  let output = [];

  let cardID = 0;
  for (let k = 0; k < 2; k++) {
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 15; i++) {
        if (k > 0) {
          if (i > 0 && i < 13) {
            output.push({ number: numbers[i], color: colors[j], id: cardID });
          }
        } else {
          output.push({ number: numbers[i], color: colors[j], id: cardID });
        }
        cardID++;
      }
    }
  }
  return output;
}
