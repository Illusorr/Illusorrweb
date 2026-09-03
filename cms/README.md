# ILLUSORR website CMS

Supabase project **Illusorr website** · ref `mivkvqibkceaayktqtds` · region ap-northeast-2
`https://mivkvqibkceaayktqtds.supabase.co`

Deliberately a **separate project** from Client Dashboard, so public traffic and
form spam can never reach live client review data.

## What is live

| | |
| --- | --- |
| `web.form_submissions` | every brief, contact enquiry and Collective application |
| `web.disciplines` | 9 rows, seeded from `collective.js` |
| `web.commissions` | 15 rows, seeded from `collective.js` |
| `web.collective_members` | empty, filled by promoting an application |
| `web.projects` | 29 rows, seeded from the `work.html` grid |
| `web.team` | empty |
| `web.settings` | `board_updated` |

All three site forms post here through `site/assets/js/forms.js`.

## Security model

The publishable key in `forms.js` is meant to be public. It is safe because of
RLS, not because it is hidden:

| role | can |
| --- | --- |
| `anon` | INSERT into `web.form_submissions`, nothing else |
| `authenticated` | full read and write across the `web` schema |

Verified against the live API:

```
POST   /rest/v1/form_submissions   201   anon may submit
GET    /rest/v1/form_submissions   401   anon cannot read a single lead
POST   /rest/v1/projects           401   anon cannot write CMS content
```

Never put the **service role** key in `forms.js` or anywhere under `site/`.

## Still to do: notifications

`web.notify_submission()` and its trigger are applied and currently a no-op.
Two steps remain, both needing credentials I should not handle.

**1. Deploy the Edge Function.** The MCP client here stringifies array
arguments, so `deploy_edge_function` fails. Deploy from your machine:

```bash
supabase functions deploy notify-submission --project-ref mivkvqibkceaayktqtds
```

Source is in `cms/functions/notify-submission/`. It sends an email via Resend
and creates a ClickUp task, independently: either can be left unconfigured and
the other still fires. It always returns 200, because the lead is already saved
and a retry would only duplicate it.

**2. Set the secrets**, then point the trigger at the function:

```bash
supabase secrets set RESEND_API_KEY=... NOTIFY_TO=hello@illusorr.com \
  NOTIFY_FROM='ILLUSORR <noreply@illusorr.com>' \
  CLICKUP_TOKEN=... CLICKUP_LIST_ID=... --project-ref mivkvqibkceaayktqtds
```

Then in the SQL editor, using your **service role** key:

```sql
alter database postgres set app.notify_url =
  'https://mivkvqibkceaayktqtds.functions.supabase.co/notify-submission';
alter database postgres set app.notify_key = '<service role key>';
```

Until both are set the trigger returns immediately and submissions still save.

## Migrations

Applied in order: `001_web_schema`, `002_rls`, `003_notify`,
`004_commissions_match_site`, `005_seed_projects`.

`004` exists because the first schema guessed the commissions board's shape.
The real board in `collective.js` carries role, discipline, sector, basis,
status and note; the first cut had title/detail/territory and would have
dropped sector and basis on the way in.

## Not built yet

The admin UI. The database, the security model and the seeded content are in
place, so the CMS is a client against a schema that already works.
