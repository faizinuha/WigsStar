-- ===========================================
-- CHAT + GROUP SCHEMA FOR SUPABASE
-- ===========================================

-- 1. GROUPS
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  creator_id bigint references profiles(id) on delete set null,
  is_private boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. GROUP MEMBERS
create table if not exists group_members (
  id bigserial primary key,
  group_id uuid references groups(id) on delete cascade,
  user_id bigint references profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default now(),
  unique(group_id, user_id)
);

-- 3. MESSAGES
create table if not exists messages (
  id bigserial primary key,
  sender_id bigint references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  receiver_id bigint references profiles(id) on delete cascade,
  content text not null,
  type text default 'text',
  reply_to bigint references messages(id) on delete set null,
  created_at timestamp with time zone default now(),
  edited_at timestamp with time zone,
  constraint check_target check (
    (group_id is not null and receiver_id is null)
    or (group_id is null and receiver_id is not null)
  )
);

-- 4. MESSAGE REACTIONS
create table if not exists message_reactions (
  id bigserial primary key,
  message_id bigint references messages(id) on delete cascade,
  user_id bigint references profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default now(),
  unique(message_id, user_id, emoji)
);

-- 5. ATTACHMENTS
create table if not exists attachments (
  id bigserial primary key,
  message_id bigint references messages(id) on delete cascade,
  file_url text not null,
  file_type text,
  file_size bigint,
  created_at timestamp with time zone default now()
);

-- 6. READ RECEIPTS
create table if not exists read_receipts (
  id bigserial primary key,
  message_id bigint references messages(id) on delete cascade,
  user_id bigint references profiles(id) on delete cascade,
  read_at timestamp with time zone default now(),
  unique(message_id, user_id)
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Groups
alter table groups enable row level security;
alter table group_members enable row level security;
alter table messages enable row level security;
alter table message_reactions enable row level security;
alter table attachments enable row level security;
alter table read_receipts enable row level security;

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- GROUPS: user can see groups if they are a member
create policy "Users can view groups they belong to"
on groups for select
using (
  exists (
    select 1 from group_members
    where group_members.group_id = groups.id
    and group_members.user_id = auth.uid()::bigint
  )
);

-- GROUP MEMBERS: user can view themselves in groups
create policy "Users can view group members of their groups"
on group_members for select
using (
  exists (
    select 1 from group_members gm
    where gm.group_id = group_members.group_id
    and gm.user_id = auth.uid()::bigint
  )
);

-- MESSAGES: user can read messages if sender/receiver or group member
create policy "Users can view their own messages or group messages"
on messages for select
using (
  sender_id = auth.uid()::bigint
  or receiver_id = auth.uid()::bigint
  or exists (
    select 1 from group_members
    where group_members.group_id = messages.group_id
    and group_members.user_id = auth.uid()::bigint
  )
);

-- MESSAGE REACTIONS: user can see reactions in their groups or messages
create policy "Users can view reactions to messages they can see"
on message_reactions for select
using (
  exists (
    select 1 from messages
    where messages.id = message_reactions.message_id
    and (
      messages.sender_id = auth.uid()::bigint
      or messages.receiver_id = auth.uid()::bigint
      or exists (
        select 1 from group_members
        where group_members.group_id = messages.group_id
        and group_members.user_id = auth.uid()::bigint
      )
    )
  )
);

-- ATTACHMENTS: user can see attachments of messages they can see
create policy "Users can view attachments of messages they can see"
on attachments for select
using (
  exists (
    select 1 from messages
    where messages.id = attachments.message_id
    and (
      messages.sender_id = auth.uid()::bigint
      or messages.receiver_id = auth.uid()::bigint
      or exists (
        select 1 from group_members
        where group_members.group_id = messages.group_id
        and group_members.user_id = auth.uid()::bigint
      )
    )
  )
);

-- READ RECEIPTS: user can view only their receipts
create policy "Users can view their own read receipts"
on read_receipts for select
using (user_id = auth.uid()::bigint);

-- ===========================================
-- DONE
-- ===========================================
