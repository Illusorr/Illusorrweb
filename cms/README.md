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

## Notifications

The trigger on `web.form_submissions` posts straight to Resend and ClickUp
using pg_net. There is no Edge Function to deploy and nothing to install: the
only step left is storing your keys.

Keys live in Supabase Vault, encrypted at rest. Anything you do not store is
skipped, so email and ClickUp are independent and either works alone.

**Email.** In the SQL editor:

```sql
select vault.create_secret('re_your_resend_key', 'RESEND_API_KEY');
select vault.create_secret('hello@illusorr.com', 'NOTIFY_TO');
-- until illusorr.com is verified in Resend, leave NOTIFY_FROM unset and it
-- falls back to Resend's shared onboarding@resend.dev sender
select vault.create_secret('ILLUSORR <noreply@illusorr.com>', 'NOTIFY_FROM');
```

**ClickUp.** The token is a personal API token (ClickUp: Settings, Apps,
Generate). The list id is the number in the URL when that list is open.

```sql
select vault.create_secret('pk_your_clickup_token', 'CLICKUP_TOKEN');
select vault.create_secret('901234567890',          'CLICKUP_LIST_ID');
```

To change one later, `select vault.update_secret(id, new_value)`.

Every outbound call is wrapped so a failure is swallowed: a rejected API key,
a ClickUp outage or a slow mail provider can never make a visitor's
submission hang, fail, or be lost. The row is committed either way.

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
