-- Create table if not exists
create table if not exists public.notes (
	id bigint primary key generated always as identity,
	title text not null
);

-- Insert sample data (idempotent)
insert into public.notes (title)
values
	('Today I created a Supabase project.')
	,('I added some data and queried it from Next.js.')
	,('It was awesome!')
on conflict do nothing;

-- Enable row level security and allow anon selects
alter table public.notes enable row level security;

-- Create policy if it doesn't exist (works on older Postgres versions)
DO $$
BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_catalog.pg_policies WHERE policyname = 'anon_select_notes'
			) THEN
			EXECUTE $sql$
				CREATE POLICY anon_select_notes
					ON public.notes
					FOR SELECT
					TO anon
					USING (true);
			$sql$;
	END IF;
END
$$;
