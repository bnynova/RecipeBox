-- Add storage buckets and policies for recipe photos and profile avatars.

insert into storage.buckets (id, name, public)
values
  ('recipe-images', 'recipe-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public can read recipe images" on storage.objects;
drop policy if exists "Public can read avatars" on storage.objects;
drop policy if exists "Authenticated users can upload recipe images" on storage.objects;
drop policy if exists "Authenticated users can update recipe images" on storage.objects;
drop policy if exists "Authenticated users can delete recipe images" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Authenticated users can update avatars" on storage.objects;
drop policy if exists "Authenticated users can delete avatars" on storage.objects;

create policy "Public can read recipe images"
  on storage.objects
  for select
  using (bucket_id = 'recipe-images');

create policy "Public can read avatars"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload recipe images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );

create policy "Authenticated users can update recipe images"
  on storage.objects
  for update
  using (
    bucket_id = 'recipe-images'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'recipe-images'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );

create policy "Authenticated users can delete recipe images"
  on storage.objects
  for delete
  using (
    bucket_id = 'recipe-images'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );

create policy "Authenticated users can upload avatars"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );

create policy "Authenticated users can update avatars"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );

create policy "Authenticated users can delete avatars"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and name like auth.uid()::text || '/%'
  );