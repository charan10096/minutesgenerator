# Uploads

Meeting transcript files are uploaded by users through the Upload page and
stored as raw text in the Supabase `meetings.raw_transcript` column. This
folder is a placeholder for any local file-based upload handling during
development. In production, all uploads go directly to Supabase Storage or
the database.
