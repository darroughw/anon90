import { Card } from "@/components/ui";
import { HELPFUL_LINKS } from "@/lib/helpfulLinks";

export default function HelpfulLinks() {
  return (
    <Card>
      <h2 style={{ marginTop: 0 }}>Helpful links</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {HELPFUL_LINKS.map((link) => (
          <li key={link.href} style={{ marginBottom: "0.85rem" }}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
            <p className="ds-field__hint" style={{ margin: "0.15rem 0 0" }}>
              {link.description}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
