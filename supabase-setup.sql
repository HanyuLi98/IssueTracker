-- =============================================
-- AE Task Manager - Supabase Database Setup
-- 在 Supabase SQL Editor 中运行此脚本
-- =============================================

-- 1. 区域表
CREATE TABLE regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 工程师表
CREATE TABLE engineers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 任务表（所有类型统一一张表，用 category 区分）
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('preSales', 'midSales', 'tickets', 'warranty', 'paidRepair')),
  date TEXT DEFAULT '',
  customer TEXT DEFAULT '',
  sales TEXT DEFAULT '',
  problem TEXT DEFAULT '',
  status TEXT DEFAULT 'ongoing',
  note TEXT DEFAULT '',
  owners TEXT[] DEFAULT '{}',
  serial_no TEXT DEFAULT '',
  order_no TEXT DEFAULT '',
  content TEXT DEFAULT '',
  task_type TEXT DEFAULT '',
  quote TEXT DEFAULT '',
  invoice TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ DEFAULT NULL,
  migrated_from TEXT DEFAULT NULL
);

-- 4. 创建索引加速查询
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_owners ON tasks USING GIN(owners);

-- 5. 启用 Row Level Security (RLS) 但允许所有已认证和匿名用户访问
-- 因为这是内部工具，我们允许所有访问
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 允许所有操作的策略
CREATE POLICY "Allow all access to regions" ON regions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to engineers" ON engineers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
