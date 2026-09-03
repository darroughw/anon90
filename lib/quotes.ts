const QUOTES = [
  "Day by day. Not the week, not the year — just today's list.",
  "You don't have to feel ready. You just have to do the list.",
  "A missed day is a fact, not a failure. Today is a new one.",
  "Call before you think you need to.",
  "Most days the work is quiet. That's what makes it work.",
  "There's no schedule to fall behind on. Only today.",
  "Some days the list is the only plan you need.",
  "Nobody does this alone — that's the whole point of the calls.",
  "Progress here looks like showing up again.",
  "What you do today is the only thing today asks of you.",
  "Small and steady outlasts big and occasional.",
  "You don't need momentum. You need today.",
  "This isn't about willpower. It's about the list.",
  "Recovery doesn't ask for certainty, just the next task.",
  "The meeting doesn't need you to have something to say. It needs you there.",
  "One task at a time. That's the whole method.",
];

export function getDailyQuote(dateStr: string): string {
  const seed = dateStr
    .split("-")
    .reduce((total, part) => total + Number(part), 0);
  return QUOTES[seed % QUOTES.length];
}
