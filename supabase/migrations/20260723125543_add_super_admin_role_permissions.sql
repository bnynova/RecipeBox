-- Clean reset of recipe roles and permissions for super admin.

alter table public.profiles
  alter column role set default 'normal';

alter table public.profiles
  alter column role set not null;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('normal', 'admin', 'super_admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Public can read recipes" on public.recipes;
drop policy if exists "Authenticated users can insert their own recipes" on public.recipes;
drop policy if exists "Users can update their own recipes" on public.recipes;
drop policy if exists "Users can delete their own recipes" on public.recipes;
drop policy if exists "Users can update their own recipes or admins can update any recipe" on public.recipes;
drop policy if exists "Users can delete their own recipes or admins can delete any recipe" on public.recipes;

create policy "Public can read recipes"
  on public.recipes
  for select
  using (true);

create policy "Authenticated users can insert their own recipes"
  on public.recipes
  for insert
  with check (
    auth.uid() = owner_id
  );

create policy "Users can update their own recipes or super admin can update any recipe"
  on public.recipes
  for update
  using (
    owner_id = auth.uid() or public.is_admin()
  )
  with check (
    owner_id = auth.uid() or public.is_admin()
  );

create policy "Users can delete their own recipes or super admin can delete any recipe"
  on public.recipes
  for delete
  using (
    owner_id = auth.uid() or public.is_admin()
  );

update public.profiles
set role = 'super_admin',
    updated_at = now()
where email = 'admin_1@gmail.com';
