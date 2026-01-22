
-- Add title and details columns to system_announcements table
ALTER TABLE system_announcements
ADD COLUMN title text,
ADD COLUMN details text;

-- Optional: Backfill title from message if needed, but since we deactivate old ones, not strictly necessary. 
-- Existing 'message' column will now serve as 'Title' in the UI if we want to migrate, 
-- or we can explicitely use 'title' column. 
-- Prompt implies: "biz adminde bannerı oluştururken orada başlık ve açıklama olsun".
-- So Form will need 'title' and 'description' inputs.
-- Let's use 'title' for banner text, and 'details' (description) for Modal text.
