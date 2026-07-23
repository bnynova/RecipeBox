-- Allow public reads of profiles for recipe author joins.

drop policy if exists "Public can read profiles" on public.profiles;

create policy "Public can read profiles"
  on public.profiles
  for select
  using (true);
