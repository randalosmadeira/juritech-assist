-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Add user_id to documentos_juridicos for tracking uploads
ALTER TABLE public.documentos_juridicos ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clientes (all authenticated users can access)
CREATE POLICY "Authenticated users can view clients"
ON public.clientes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clientes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clientes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients"
ON public.clientes FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for processos (all authenticated users can access)
CREATE POLICY "Authenticated users can view processos"
ON public.processos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert processos"
ON public.processos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update processos"
ON public.processos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete processos"
ON public.processos FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for publicacoes (all authenticated users can access)
CREATE POLICY "Authenticated users can view publicacoes"
ON public.publicacoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert publicacoes"
ON public.publicacoes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update publicacoes"
ON public.publicacoes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete publicacoes"
ON public.publicacoes FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for prazos_processuais (all authenticated users can access)
CREATE POLICY "Authenticated users can view prazos"
ON public.prazos_processuais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert prazos"
ON public.prazos_processuais FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prazos"
ON public.prazos_processuais FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete prazos"
ON public.prazos_processuais FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for feriados (all authenticated users can access)
CREATE POLICY "Authenticated users can view feriados"
ON public.feriados FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert feriados"
ON public.feriados FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update feriados"
ON public.feriados FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete feriados"
ON public.feriados FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for tarefas (all authenticated users can access)
CREATE POLICY "Authenticated users can view tarefas"
ON public.tarefas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tarefas"
ON public.tarefas FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tarefas"
ON public.tarefas FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tarefas"
ON public.tarefas FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for workflows (all authenticated users can access)
CREATE POLICY "Authenticated users can view workflows"
ON public.workflows FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert workflows"
ON public.workflows FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflows"
ON public.workflows FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete workflows"
ON public.workflows FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for documentos_juridicos (users can see all, track who uploaded)
CREATE POLICY "Authenticated users can view documentos"
ON public.documentos_juridicos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can upload documentos"
ON public.documentos_juridicos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update documentos"
ON public.documentos_juridicos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete documentos"
ON public.documentos_juridicos FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for auditorias (admin only)
CREATE POLICY "Admins can view auditorias"
ON public.auditorias FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert auditorias"
ON public.auditorias FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update auditorias"
ON public.auditorias FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete auditorias"
ON public.auditorias FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for easyjur_sessions (admin only)
CREATE POLICY "Admins can view easyjur sessions"
ON public.easyjur_sessions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage easyjur sessions"
ON public.easyjur_sessions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for easyjur_auth_logs (admin only)
CREATE POLICY "Admins can view easyjur logs"
ON public.easyjur_auth_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage easyjur logs"
ON public.easyjur_auth_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));