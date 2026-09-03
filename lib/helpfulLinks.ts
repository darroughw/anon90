export type HelpfulLink = {
  label: string;
  href: string;
  description: string;
};

export const HELPFUL_LINKS: HelpfulLink[] = [
  {
    label: "SAMHSA National Helpline",
    href: "https://www.samhsa.gov/find-help/national-helpline",
    description: "Free, confidential, 24/7. Call or text 1-800-662-4357.",
  },
  {
    label: "988 Suicide & Crisis Lifeline",
    href: "https://988lifeline.org",
    description: "Call or text 988, 24/7.",
  },
  {
    label: "AA meeting finder",
    href: "https://www.aa.org/find-aa",
    description: "Find an Alcoholics Anonymous meeting near you.",
  },
  {
    label: "AA Daily Reflections",
    href: "https://www.aa.org/daily-reflections",
    description: "A short reflection for today, from AA's Conference-approved literature.",
  },
  {
    label: "NA meeting finder",
    href: "https://www.na.org/meetingsearch/",
    description: "Find a Narcotics Anonymous meeting near you.",
  },
  {
    label: "Al-Anon",
    href: "https://al-anon.org",
    description: "Support for friends and family of people affected by someone else's drinking.",
  },
];
