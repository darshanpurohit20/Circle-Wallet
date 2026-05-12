-- DEVELOPMENT ONLY RLS POLICIES
-- Use during local development/testing

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;

CREATE POLICY "dev_groups_all"
ON public.groups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can manage group members" ON public.group_members;

CREATE POLICY "dev_group_members_all"
ON public.group_members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "dev_profiles_all"
ON public.profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);