-- Create recurring_expenses table
create table recurring_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount decimal(10,2) not null,
  category_id uuid references categories(id) on delete set null,
  payment_day integer not null check (payment_day >= 1 and payment_day <= 31),
  created_at timestamptz default now()
);

-- Enable RLS
alter table recurring_expenses enable row level security;

-- Create policies
create policy "Users can view their own recurring expenses"
  on recurring_expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring expenses"
  on recurring_expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring expenses"
  on recurring_expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recurring expenses"
  on recurring_expenses for delete
  using (auth.uid() = user_id);
