-- Add semester column to documents table
ALTER TABLE public.documents 
ADD COLUMN semester text;

-- Create index for semester filtering
CREATE INDEX idx_documents_semester ON public.documents(semester) WHERE status = 'active';

-- Create semesters reference table (admin-managed)
CREATE TABLE public.semesters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on semesters table
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

-- Anyone can view semesters
CREATE POLICY "Anyone can view semesters"
ON public.semesters
FOR SELECT
USING (true);

-- Only admins can manage semesters
CREATE POLICY "Admins can manage semesters"
ON public.semesters
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insert default semesters
INSERT INTO public.semesters (name, display_order) VALUES
('Semester 1', 1),
('Semester 2', 2),
('Semester 3', 3),
('Semester 4', 4),
('Semester 5', 5),
('Semester 6', 6),
('Semester 7', 7),
('Semester 8', 8);