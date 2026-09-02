"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  FormField,
  Input,
  ProgressBar,
  StatDisplay,
  Switch,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

function ToastSection() {
  const { showToast } = useToast();

  return (
    <section>
      <h2>Toast</h2>
      <div className="ds-demo-row">
        <Button variant="secondary" onClick={() => showToast("Reminder: today's checklist is open.")}>
          Show info toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => showToast("Something went wrong.", { variant: "error" })}
        >
          Show error toast
        </Button>
      </div>
    </section>
  );
}

export default function DesignSystemDemo() {
  const [switchOn, setSwitchOn] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <ToastProvider>
      <div className="ds-demo">
        <section>
          <h2>Buttons</h2>
          <div className="ds-demo-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <Divider />

        <section>
          <h2>Form fields</h2>
          <FormField label="Email address" htmlFor="ds-email" hint="We'll never share this.">
            <Input type="email" name="ds-email" />
          </FormField>
          <FormField label="Journal entry" htmlFor="ds-journal" error="This field is required.">
            <Textarea name="ds-journal" />
          </FormField>
          <Checkbox
            label="Email me reminders"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />
        </section>

        <Divider />

        <section>
          <h2>Switch</h2>
          <Switch label="Toast reminders" checked={switchOn} onCheckedChange={setSwitchOn} />
        </section>

        <Divider />

        <section>
          <h2>Badge &amp; Progress</h2>
          <div className="ds-demo-row">
            <Badge>90 days</Badge>
            <Badge>6 months</Badge>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <ProgressBar value={62} label="Progress to next milestone" />
          </div>
        </section>

        <Divider />

        <section>
          <h2>Stats</h2>
          <div className="ds-demo-row">
            <StatDisplay value={14} label="Day streak" />
            <StatDisplay value={2} label="Week streak" />
          </div>
        </section>

        <Divider />

        <section>
          <h2>Card &amp; Avatar</h2>
          <Card>
            <div className="ds-demo-row" style={{ alignItems: "center" }}>
              <Avatar name="QuietFalcon42" label="QuietFalcon42" />
              <span>QuietFalcon42</span>
            </div>
          </Card>
        </section>

        <Divider />

        <section>
          <h2>Alert</h2>
          <Alert variant="info">Your reminder settings were saved.</Alert>
          <div style={{ marginTop: "0.75rem" }}>
            <Alert variant="error">Enter a valid email address.</Alert>
          </div>
        </section>

        <Divider />

        <ToastSection />

        <Divider />

        <section>
          <h2>Dialog</h2>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Share snapshot">
            <p>Send your streak and milestone progress. No journal entries included.</p>
            <div className="ds-demo-row" style={{ marginTop: "1rem" }}>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Send
              </Button>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </Dialog>
        </section>
      </div>
    </ToastProvider>
  );
}
