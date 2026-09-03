import { Button, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

export const subject = "A few tasks left on today's list";

type ReminderEmailProps = {
  tasksRemaining: number;
  appUrl?: string;
};

export default function ReminderEmail({
  tasksRemaining,
  appUrl = "https://rhythmrecovery.app/dashboard",
}: ReminderEmailProps) {
  return (
    <EmailLayout preview="A few tasks are still open today.">
      <Text style={heading}>Today isn&apos;t closed yet.</Text>
      <Text style={paragraph}>
        {tasksRemaining} {tasksRemaining === 1 ? "task is" : "tasks are"} still open on today&apos;s
        list.
      </Text>
      <Button href={appUrl} style={button}>
        Open today&apos;s list
      </Button>
    </EmailLayout>
  );
}

ReminderEmail.PreviewProps = {
  tasksRemaining: 3,
  appUrl: "https://rhythmrecovery.app/dashboard",
} satisfies ReminderEmailProps;

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#3d332a",
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#1a120b",
  color: "#f2e9dd",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "4px",
  display: "inline-block",
};
