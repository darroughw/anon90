import { JWT } from "google-auth-library";

type SignupRow = {
  email: string;
  source: "email" | "google";
};

function getClient(): JWT | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    return null;
  }

  return new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendSignupRow(row: SignupRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const client = getClient();

  if (!client || !spreadsheetId) {
    console.warn("[sheets] not configured, skipping append for", row.email);
    return;
  }

  const { token } = await client.getAccessToken();
  const range = "Signups!A:C";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [[new Date().toISOString(), row.email, row.source]],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sheets append failed: ${response.status} ${text}`);
  }
}
