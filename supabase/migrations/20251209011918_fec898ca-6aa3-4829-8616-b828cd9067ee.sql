-- Drop existing check constraint and add updated one that includes in_progress
ALTER TABLE public.document_requests DROP CONSTRAINT IF EXISTS document_requests_status_check;

ALTER TABLE public.document_requests 
ADD CONSTRAINT document_requests_status_check 
CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected'));