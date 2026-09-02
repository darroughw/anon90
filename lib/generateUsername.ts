const ADJECTIVES = [
  "Quiet", "Steady", "Calm", "Gentle", "Patient", "Grounded", "Still",
  "Clear", "Even", "Soft", "Open", "Kind", "Honest", "Faithful", "Humble",
  "Brave", "Sturdy", "Wise", "Warm", "Bright",
];

const NOUNS = [
  "Falcon", "River", "Harbor", "Cedar", "Summit", "Meadow", "Compass",
  "Anchor", "Horizon", "Willow", "Ridge", "Ember", "Current", "Trail",
  "Pine", "Stone", "Maple", "Beacon", "Path", "Dawn",
];

export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${adjective}${noun}${number}`;
}
