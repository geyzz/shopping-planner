-- Lists table
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Individual items inside a list
create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade not null,
  content text not null,
  is_checked boolean default false,
  position integer default 0,
  created_at timestamptz default now()
);

-- Calendar events
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  list_id uuid references lists(id) on delete set null,
  title text not null,
  event_date date not null,
  created_at timestamptz default now()
);

-- Row Level Security so users only see their own data
alter table lists enable row level security;
alter table list_items enable row level security;
alter table calendar_events enable row level security;

create policy "Users manage their own lists"
  on lists for all
  using (auth.uid() = user_id);

create policy "Users manage items in their own lists"
  on list_items for all
  using (
    exists (
      select 1 from lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

create policy "Users manage their own calendar events"
  on calendar_events for all
  using (auth.uid() = user_id);