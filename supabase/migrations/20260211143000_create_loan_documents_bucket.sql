-- Create Supabase Storage bucket for loan documents
-- This bucket will store all loan application attachments

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'loan-documents',
    'loan-documents',
    true, -- Public bucket so documents can be accessed via URL
    5242880, -- 5MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the loan-documents bucket
CREATE POLICY "Authenticated users can upload loan documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'loan-documents');

CREATE POLICY "Authenticated users can view loan documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'loan-documents');

CREATE POLICY "Users can update their own loan documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own loan documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
