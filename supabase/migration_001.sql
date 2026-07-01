-- Add business_id to hmrc_connections
alter table public.hmrc_connections add column if not exists business_id text;

-- Add hmrc_business_id to obligations for reference
alter table public.obligations add column if not exists hmrc_business_id text;
