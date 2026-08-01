ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS subject_code text,
  ADD COLUMN IF NOT EXISTS doc_type text NOT NULL DEFAULT 'notes',
  ADD COLUMN IF NOT EXISTS exam_type text,
  ADD COLUMN IF NOT EXISTS exam_year integer,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS topics text[],
  ADD COLUMN IF NOT EXISTS prep_tips text,
  ADD COLUMN IF NOT EXISTS page_count integer,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.document_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.document_reports TO authenticated;
GRANT INSERT ON public.document_reports TO anon;
GRANT ALL ON public.document_reports TO service_role;
ALTER TABLE public.document_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a report" ON public.document_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own reports" ON public.document_reports FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reports" ON public.document_reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.document_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_id)
);
GRANT SELECT, INSERT, DELETE ON public.document_likes TO authenticated;
GRANT ALL ON public.document_likes TO service_role;
ALTER TABLE public.document_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own likes" ON public.document_likes FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can add own likes" ON public.document_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.document_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.search_queries TO anon, authenticated;
GRANT SELECT ON public.search_queries TO authenticated;
GRANT ALL ON public.search_queries TO service_role;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a search" ON public.search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view searches" ON public.search_queries FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_document_view(_document_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.documents SET view_count = view_count + 1 WHERE id = _document_id AND status = 'active';
$$;
GRANT EXECUTE ON FUNCTION public.increment_document_view(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_document_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.documents SET helpful_count = helpful_count + 1 WHERE id = NEW.document_id;
    RETURN NEW;
  ELSE
    UPDATE public.documents SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.document_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_document_likes_count ON public.document_likes;
CREATE TRIGGER trg_document_likes_count
AFTER INSERT OR DELETE ON public.document_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_document_helpful_count();