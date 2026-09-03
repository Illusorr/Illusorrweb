-- Fire a notification the moment a form lands.
--
-- The trigger does not send anything itself. It makes one async HTTP call via
-- pg_net to the notify-submission Edge Function and returns immediately, so a
-- slow mail provider or a ClickUp outage can never make the visitor's form
-- submission hang or fail.
--
-- Requires two settings, set once with:
--   alter database postgres set app.notify_url  = 'https://<ref>.functions.supabase.co/notify-submission';
--   alter database postgres set app.notify_key  = '<service role key>';

create extension if not exists pg_net with schema extensions;

create or replace function web.notify_submission() returns trigger
language plpgsql security definer set search_path = web, extensions, public as $$
declare
  url text := current_setting('app.notify_url', true);
  key text := current_setting('app.notify_key', true);
begin
  if url is null or key is null then
    return new;                     -- not configured yet; never block the insert
  end if;
  perform net.http_post(
    url     := url,
    headers := jsonb_build_object('Content-Type','application/json',
                                  'Authorization','Bearer ' || key),
    body    := jsonb_build_object('id', new.id, 'kind', new.kind,
                                  'name', new.name, 'email', new.email,
                                  'page', new.page, 'payload', new.payload,
                                  'created_at', new.created_at)
  );
  return new;
exception when others then
  -- a broken notification must never cost us the lead
  return new;
end $$;

create trigger t_notify_submission
  after insert on web.form_submissions
  for each row execute function web.notify_submission();
