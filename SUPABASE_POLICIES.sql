-- INTERNED MOVIES: permisos recomendados para la tabla public.movies
-- Ejecutá en Supabase > SQL Editor.
-- La lectura es pública; solo usuarios autenticados pueden escribir.
alter table public.movies enable row level security;

grant select on public.movies to anon, authenticated;
grant insert, update, delete on public.movies to authenticated;

drop policy if exists "Todos pueden ver las peliculas" on public.movies;
create policy "Todos pueden ver las peliculas"
on public.movies for select to anon, authenticated using (true);

drop policy if exists "Administradores autenticados pueden agregar peliculas" on public.movies;
create policy "Administradores autenticados pueden agregar peliculas"
on public.movies for insert to authenticated with check (auth.uid() is not null);

drop policy if exists "Administradores autenticados pueden editar peliculas" on public.movies;
create policy "Administradores autenticados pueden editar peliculas"
on public.movies for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "Administradores autenticados pueden borrar peliculas" on public.movies;
create policy "Administradores autenticados pueden borrar peliculas"
on public.movies for delete to authenticated using (auth.uid() is not null);

-- Antes de usar el panel Admin, creá tu usuario en Supabase > Authentication > Users.
-- No pongas una secret key en el sitio. Solo se usa la publishable key en app.js.
