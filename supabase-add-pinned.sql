-- 在 Supabase SQL Editor 中运行此脚本，给 tasks 表添加置顶字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
