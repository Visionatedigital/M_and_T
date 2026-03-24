-- Optional remarks shown as "Narration" on cash book and journal; distinct from category/description.
ALTER TABLE public.accounting_entries ADD COLUMN IF NOT EXISTS narration text;
