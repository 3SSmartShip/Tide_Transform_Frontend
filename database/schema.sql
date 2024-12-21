-- Create api_keys table
create table if not exists api_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  key text not null unique,
  status text check (status in ('Active', 'Expired', 'Revoked')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for api_keys
alter table api_keys enable row level security;

-- Create policies for api_keys
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
create table if not exists profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL,
    role TEXT NOT NULL,
    is_onboarded BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Users can insert own profile" 
    on profiles for insert 
    with check (auth.uid() = id);
   
create policy "Users can update own profile" 
    on profiles for update 
    using (auth.uid() = id);