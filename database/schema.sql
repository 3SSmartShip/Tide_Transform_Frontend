create table api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  key text not null unique,
  status text check (status in ('Active', 'Expired', 'Revoked')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table api_keys enable row level security;

-- Create policies
create policy "Users can view their own api keys"
  on api_keys for select
  using (auth.uid() = user_id);

create policy "Users can create their own api keys"
  on api_keys for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own api keys"
  on api_keys for update
  using (auth.uid() = user_id);

create policy "Users can delete their own api keys"
  on api_keys for delete
  using (auth.uid() = user_id);

-- Create profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text,
    email text,
    updated_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

create policy "Users can update own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

create policy "Users can insert own profile" 
    on public.profiles for insert 
    with check (auth.uid() = id);
