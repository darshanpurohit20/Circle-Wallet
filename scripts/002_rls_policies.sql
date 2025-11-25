-- RLS Policies for Circle Wallet

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view profiles in same group" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT profile_id FROM public.group_members 
      WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE profile_id = auth.uid()
      )
    )
  );

-- Groups policies
CREATE POLICY "Users can view groups they belong to" ON public.groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can update groups" ON public.groups
  FOR UPDATE USING (
    id IN (
      SELECT group_id FROM public.group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Families policies
CREATE POLICY "Users can view families in their groups" ON public.families
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can manage families" ON public.families
  FOR ALL USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
    )
  );

-- Family members policies
CREATE POLICY "Users can view family members in their groups" ON public.family_members
  FOR SELECT USING (
    family_id IN (
      SELECT id FROM public.families WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage family members" ON public.family_members
  FOR ALL USING (
    family_id IN (
      SELECT id FROM public.families WHERE group_id IN (
        SELECT group_id FROM public.group_members 
        WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
      )
    )
  );

-- Transactions policies
CREATE POLICY "Users can view transactions in their groups" ON public.transactions
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Members can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can update transactions" ON public.transactions
  FOR UPDATE USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
    )
  );

-- Transaction splits policies
CREATE POLICY "Users can view splits in their groups" ON public.transaction_splits
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can insert splits" ON public.transaction_splits
  FOR INSERT WITH CHECK (
    transaction_id IN (
      SELECT id FROM public.transactions WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE profile_id = auth.uid()
      )
    )
  );

-- Wallet deposits policies
CREATE POLICY "Users can view deposits in their groups" ON public.wallet_deposits
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Members can insert deposits" ON public.wallet_deposits
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

-- Invites policies
CREATE POLICY "Users can view invites for their groups" ON public.invites
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage invites" ON public.invites
  FOR ALL USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
    )
  );

-- Group members policies
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM public.group_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Admins can manage group members" ON public.group_members
  FOR ALL USING (
    group_id IN (
      SELECT group_id FROM public.group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'co-admin')
    )
  );

-- Merchants policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view merchants" ON public.merchants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage merchants" ON public.merchants
  FOR ALL USING (
    auth.uid() IN (
      SELECT profile_id FROM public.group_members WHERE role = 'admin'
    )
  );
