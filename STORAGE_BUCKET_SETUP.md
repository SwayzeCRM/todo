# Supabase Storage Bucket Setup Guide

## Overview
This application uses Supabase Storage for video uploads. Follow these steps to properly configure the storage bucket.

## Setup Instructions

### 1. Create the Storage Bucket

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `task-videos`
   - **Public**: Yes (recommended for easier access)
   - Click **Create bucket**

### 2. Configure RLS Policies

After creating the bucket, set up Row Level Security (RLS) policies:

1. Click on the `task-videos` bucket
2. Go to **Policies** tab
3. Add the following policies:

#### Upload Policy
```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'task-videos' 
    AND auth.role() = 'authenticated'
);
```

#### View Policy
```sql
-- Allow public to view videos
CREATE POLICY "Allow public viewing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-videos');
```

#### Update Policy
```sql
-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'task-videos' 
    AND auth.role() = 'authenticated'
);
```

#### Delete Policy
```sql
-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'task-videos' 
    AND auth.role() = 'authenticated'
);
```

### 3. Configure CORS (if needed)

If you're hosting the application on a different domain:

1. Go to **Settings** → **API**
2. Add your domain to the CORS configuration
3. Include methods: `GET`, `POST`, `PUT`, `DELETE`

### 4. File Size Limits

Default file size limits:
- Free tier: 50MB per file
- Pro tier: 5GB per file

To modify limits (Pro tier only):
1. Go to **Settings** → **Storage**
2. Adjust the file size limit as needed

### 5. Verify Setup

Test the storage bucket:

1. Open the admin panel (`admin.html`)
2. Create or edit a task
3. Try uploading a video file
4. Verify the upload completes successfully
5. Check that the video URL is generated

### Troubleshooting

#### "Storage bucket not found" error
- Ensure the bucket name is exactly `task-videos`
- Check that the bucket was created successfully
- Verify your Supabase URL and anon key are correct

#### "Permission denied" error
- Verify RLS policies are applied
- Check authentication status
- Ensure the anon key has proper permissions

#### Upload fails silently
- Check browser console for errors
- Verify file size is within limits
- Ensure file type is supported (mp4, mov, avi, webm)

#### Video won't play
- Check if bucket is set to public
- Verify the generated URL is accessible
- Test with a different video format

### Supported Video Formats
- MP4 (.mp4)
- MOV (.mov)
- AVI (.avi)
- WebM (.webm)

### Storage Costs
- Free tier: 1GB storage, 2GB bandwidth/month
- Pro tier: 100GB storage, 200GB bandwidth/month
- Additional storage: $0.021/GB/month
- Additional bandwidth: $0.09/GB

## Security Considerations

1. **Authentication**: Only authenticated users can upload/modify videos
2. **File Validation**: Implement client-side file type and size validation
3. **Rate Limiting**: Consider implementing upload rate limits
4. **Monitoring**: Regular check storage usage in Supabase dashboard

## Database Schema

The video storage integrates with the following columns in `onboarding_tasks`:

```sql
video_type VARCHAR(20) -- 'url' or 'upload'
video_storage_path TEXT -- Path in Supabase storage
video_url TEXT -- Original column for external URLs
```

## Need Help?

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Dashboard](https://app.supabase.com)
- Check browser console for detailed error messages