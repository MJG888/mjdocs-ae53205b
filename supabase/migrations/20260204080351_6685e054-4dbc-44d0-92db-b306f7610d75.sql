-- Make the documents storage bucket private
-- This ensures file metadata cannot be enumerated by unauthenticated users
-- All file access will go through signed URLs (already implemented)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documents';