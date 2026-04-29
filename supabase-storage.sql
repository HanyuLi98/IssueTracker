-- 在 Supabase SQL Editor 中运行
-- 创建 invoices 存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有用户上传和下载
CREATE POLICY "Allow public upload to invoices" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices');
CREATE POLICY "Allow public read from invoices" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "Allow public delete from invoices" ON storage.objects FOR DELETE USING (bucket_id = 'invoices');
