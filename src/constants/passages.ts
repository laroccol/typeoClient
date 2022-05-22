import { TextTypes } from "./settings";

export const Passages = [
  "Specialized uniforms, such as nun and priest garb, can be most helpful. Check out your local uniform store for a wide range of clothes that will get you in, and especially out, of all kinds of stores.",
  "It's enough for me to be sure that you and I exist at this moment.",
  "We've known each other for many years but this is the first time you've ever come to me for counsel or for help. I can't remember the last time you invited me to your house for a cup of coffee, even though my wife is Godmother to your only child. But, let's be frank here. You never wanted my friendship and you were afraid to be in my debt.",
  "The moon belongs to everyone; the best things in life are free. The stars belong to everyone; they gleam there for you and me. The flowers in spring, the robins that sing, the sunbeams that shine - they're yours, they're mine. And love can come to everyone - the best things in life are free!",
  "When the shoes first fell from the sky, he remembered thinking that destiny had struck him. Now he thought so again. It was more than a coincidence. It had to be destiny.",
  "Higher and higher he climbed. His strength came from somewhere deep inside himself and also seemed to come from the outside as well. After focusing on Big Thumb for so long, it was as if the rock had absorbed his energy and now acted like a kind of giant magnet pulling him toward it.",
  "We were playing checkers. I used to kid her once in a while because she wouldn't take her kings out of the back row. But I didn't kid her much though. You never wanted to kid Jane too much. I think I really like it best when you can kid the pants off a girl when the opportunity arises, but it's a funny thing. The girls I like best are ones I never feel much like kidding.",
  "In every war, there are calms between storms. There will be days when you lose faith in some of us, days when our allies turn against us, but the day will never come if we forsake this planet and its people.",
  "Say what you will. But a person just cannot know what he doesn't know. And you can't always see that a bad thing is going to happen before it happens. If you could, no bad would ever come.",
  "There are very few things I wish I could change about those two decades, but there are many things I wish I had known. I wish I had known, for instance, that such a long period of being single was in the cards for me. I also wish I'd known earlier that such a delay was not abnormal among my generation.",
  "I'd ask you about love, you'd probably quote me a sonnet. But you've never looked at a woman and been totally vulnerable. Known someone that could level you with her eyes, feeling like God put an angel on earth just for you.",
];

export const CommonWords = [
  "the",
  "of",
  "and",
  "a",
  "to",
  "in",
  "is",
  "you",
  "that",
  "it",
  "he",
  "was",
  "for",
  "on",
  "are",
  "as",
  "with",
  "his",
  "they",
  "I",
  "at",
  "be",
  "this",
  "have",
  "from",
  "or",
  "one",
  "had",
  "by",
  "word",
  "but",
  "not",
  "what",
  "all",
  "were",
  "we",
  "when",
  "your",
  "can",
  "said",
  "there",
  "use",
  "an",
  "each",
  "which",
  "she",
  "do",
  "how",
  "their",
  "if",
  "will",
  "up",
  "other",
  "about",
  "out",
  "many",
  "then",
  "them",
  "these",
  "so",
  "some",
  "her",
  "would",
  "make",
  "like",
  "him",
  "into",
  "time",
  "has",
  "look",
  "two",
  "more",
  "write",
  "go",
  "see",
  "number",
  "no",
  "way",
  "could",
  "people",
  "my",
  "than",
  "first",
  "water",
  "been",
  "call",
  "who",
  "oil",
  "its",
  "now",
  "find",
  "long",
  "down",
  "day",
  "did",
  "get",
  "come",
  "made",
  "may",
  "part",
];

export const getPassage = (textType: TextTypes) => {
  let newPassage = "";

  switch (textType) {
    case TextTypes.PASSAGE: {
      const nextPassageIndex = Math.floor(Math.random() * Passages.length);
      newPassage = Passages[nextPassageIndex];
      break;
    }
    case TextTypes.TOP_WORDS: {
      const arr = [];
      const availableWords = [...CommonWords];
      let prevWord = "";
      for (let i = 0; i < 70; i++) {
        const randIndex = Math.floor(Math.random() * availableWords.length);
        const word = availableWords[randIndex];
        arr.push(word);
        availableWords.splice(randIndex, 1);
        if (i !== 0) availableWords.push(prevWord);
        prevWord = word;
      }
      newPassage = arr.join(" ");
      break;
    }
    default:
      break;
  }

  return newPassage;
};
