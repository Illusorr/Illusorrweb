/**
 * notify-submission — called by the web.form_submissions insert trigger.
 *
 * Two destinations, both optional and independent: if one is not configured
 * or fails, the other still goes out, and the function always returns 200 so
 * a retry storm cannot form. The visitor's submission is already committed by
 * the time this runs, so nothing here can lose a lead.
 *
 * Secrets (set with `supabase secrets set NAME=value`, never in the repo):
 *   RESEND_API_KEY     email delivery
 *   NOTIFY_TO          defaults to hello@illusorr.com
 *   NOTIFY_FROM        a verified sender on your Resend domain
 *   CLICKUP_TOKEN      ClickUp personal API token
 *   CLICKUP_LIST_ID    the list new enquiries should land in
 */
const KIND_LABEL: Record<string, string> = {
  brief: "Brief",
  contact: "Contact enquiry",
  collective: "Collective application",
};

const env = (k: string) => Deno.env.get(k) ?? "";

function summarise(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

async function sendEmail(s: any, body: string) {
  const key = env("RESEND_API_KEY");
  if (!key) return "skipped: no RESEND_API_KEY";
  const label = KIND_LABEL[s.kind] ?? s.kind;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env("NOTIFY_FROM") || "ILLUSORR <noreply@illusorr.com>",
      to: [env("NOTIFY_TO") || "hello@illusorr.com"],
      // replying goes straight back to the person who wrote in
      reply_to: s.email || undefined,
      subject: `${label} — ${s.name || s.email || "no name given"}`,
      text: `${label}\n\nFrom: ${s.name || "-"} <${s.email || "-"}>\n` +
            `Page: ${s.page || "-"}\nReceived: ${s.created_at}\n\n${body}\n`,
    }),
  });
  return r.ok ? "sent" : `failed ${r.status}: ${(await r.text()).slice(0, 160)}`;
}

async function sendClickUp(s: any, body: string) {
  const token = env("CLICKUP_TOKEN"), list = env("CLICKUP_LIST_ID");
  if (!token || !list) return "skipped: no CLICKUP_TOKEN or CLICKUP_LIST_ID";
  const label = KIND_LABEL[s.kind] ?? s.kind;
  const r = await fetch(`https://api.clickup.com/api/v2/list/${list}/task`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${label}: ${s.name || s.email || "no name given"}`,
      description:
        `**${label}**\n\n` +
        `- Name: ${s.name || "-"}\n- Email: ${s.email || "-"}\n` +
        `- Page: ${s.page || "-"}\n- Received: ${s.created_at}\n\n${body}`,
      tags: [s.kind],
    }),
  });
  return r.ok ? "created" : `failed ${r.status}: ${(await r.text()).slice(0, 160)}`;
}

Deno.serve(async (req) => {
  let s: any;
  try {
    s = await req.json();
  } catch {
    return new Response("bad payload", { status: 400 });
  }
  const body = summarise(s.payload ?? {});
  // both run regardless of the other's outcome
  const [email, clickup] = await Promise.all([
    sendEmail(s, body).catch((e) => `error: ${e}`),
    sendClickUp(s, body).catch((e) => `error: ${e}`),
  ]);
  console.log(JSON.stringify({ id: s.id, kind: s.kind, email, clickup }));
  // always 200: the lead is already saved, a retry would only duplicate
  return new Response(JSON.stringify({ email, clickup }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
