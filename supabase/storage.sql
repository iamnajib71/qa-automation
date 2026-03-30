insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy "evidence_bucket_read_authenticated" on storage.objects
for select to authenticated
using (bucket_id = 'evidence');

create policy "evidence_bucket_write_editor_roles" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'evidence'
  and public.get_my_role() in ('admin', 'qa_analyst')
);

create policy "evidence_bucket_update_editor_roles" on storage.objects
for update to authenticated
using (
  bucket_id = 'evidence'
  and public.get_my_role() in ('admin', 'qa_analyst')
)
with check (
  bucket_id = 'evidence'
  and public.get_my_role() in ('admin', 'qa_analyst')
);

create policy "evidence_bucket_delete_admin_only" on storage.objects
for delete to authenticated
using (
  bucket_id = 'evidence'
  and public.get_my_role() = 'admin'
);
