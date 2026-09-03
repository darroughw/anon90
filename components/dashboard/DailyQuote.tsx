import { getDailyQuote } from "@/lib/quotes";

export default function DailyQuote({ date }: { date: string }) {
  return (
    <p
      className="hint"
      style={{ textAlign: "center", marginBottom: "1.5rem", fontStyle: "italic" }}
    >
      &ldquo;{getDailyQuote(date)}&rdquo;
    </p>
  );
}
