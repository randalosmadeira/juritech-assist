-- Corrigir search_path na função de trigger
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER update_easyjur_sessions_updated_at
BEFORE UPDATE ON public.easyjur_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();