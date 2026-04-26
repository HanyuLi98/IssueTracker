-- 在 Supabase SQL Editor 中运行

-- 1. 修改 category 约束，允许 keyProject
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check CHECK (category IN ('preSales', 'midSales', 'tickets', 'warranty', 'paidRepair', 'keyProject'));

-- 2. 添加新字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_desc TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS craft TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS requirement TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- 3. 确保日志表存在
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT DEFAULT '',
  target TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow all access to audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
