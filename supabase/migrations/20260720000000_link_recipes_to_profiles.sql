-- Allow recipes.owner_id to join directly to public.profiles for dashboard author data.

alter table public.recipes
add constraint recipes_owner_profile_fkey
foreign key (owner_id)
references public.profiles (id)
on delete cascade;