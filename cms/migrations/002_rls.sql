-- Row level security for the website schema.
--
-- The public site is anonymous, so the anon role must be able to INSERT a form
-- submission and nothing else: no select, no update, no delete. Without the
-- select denial anyone holding the publishable key could read every lead.

alter table web.form_submissions   enable row level security;
alter table web.disciplines        enable row level security;
alter table web.commissions        enable row level security;
alter table web.collective_members enable row level security;
alter table web.projects           enable row level security;
alter table web.team               enable row level security;

grant usage on schema web to anon, authenticated;

-- anonymous visitors: write-only, on the intake table only
grant insert on web.form_submissions to anon;
create policy "anon may submit a form"
  on web.form_submissions for insert to anon with check (true);

-- signed-in staff: full read and write across the CMS
grant select, insert, update, delete on all tables in schema web to authenticated;
do $$
declare t text;
begin
  foreach t in array array['form_submissions','disciplines','commissions',
                           'collective_members','projects','team']
  loop
    execute format(
      'create policy "staff read %1$s"   on web.%1$I for select to authenticated using (true);
       create policy "staff write %1$s"  on web.%1$I for insert to authenticated with check (true);
       create policy "staff update %1$s" on web.%1$I for update to authenticated using (true);
       create policy "staff delete %1$s" on web.%1$I for delete to authenticated using (true);', t);
  end loop;
end $$;
