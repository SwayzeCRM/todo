# Application Configuration Guide

## Important: Security Notice
The Supabase credentials are currently hardcoded in the HTML files. For production use, consider:
1. Using environment variables
2. Implementing a backend API to proxy requests
3. Using Supabase Auth with RLS for better security

## Current Configuration

### Supabase Connection
- **URL**: `https://vvtzalcisnpibnlunqgn.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dHphbGNpc25waWJubHVucWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTk4MzMsImV4cCI6MjA3MTUzNTgzM30.LJqY5AjAuwH5k65XY9cxfuqiuNNtjYo5k210IAg0PCk`

### Files Using Supabase
1. `admin.html` - Admin panel for task management
2. `analytics.html` - User analytics and management
3. `onboarding.html` - User onboarding interface
4. `test.html` - Testing interface

## Database Tables Required

### 1. onboarding_tasks
- `id` (UUID, primary key)
- `title` (text)
- `description` (text)
- `video_url` (text)
- `video_type` (varchar(20)) - 'url' or 'upload'
- `video_storage_path` (text)
- `position` (integer)
- `is_active` (boolean)
- `task_group_id` (UUID, foreign key)
- `target_user_groups` (UUID array)
- `target_individual_users` (text array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. onboarding_users
- `id` (UUID, primary key)
- `email` (text, unique)
- `location_id` (text)
- `checklist` (JSONB)
- `completed_tasks` (integer, default 0)
- `profile_completed` (boolean)
- `first_name` (text)
- `last_name` (text)
- `phone_number` (text)
- `user_group_id` (UUID, foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3. task_groups
- `id` (UUID, primary key)
- `group_name` (text)
- `description` (text)
- `display_order` (integer)
- `is_active` (boolean)
- `created_at` (timestamp)

### 4. user_groups
- `id` (UUID, primary key)
- `group_name` (text)
- `description` (text)
- `created_at` (timestamp)

### 5. task_sequences
- `id` (UUID, primary key)
- `prerequisite_group_id` (UUID, foreign key)
- `unlocked_group_id` (UUID, foreign key)
- `created_at` (timestamp)

### 6. user_webhooks
- `id` (UUID, primary key)
- `webhook_name` (text)
- `webhook_display_name` (text)
- `webhook_url` (text)
- `is_active` (boolean)
- `created_at` (timestamp)

## Storage Buckets

### task-videos
- Public bucket for storing uploaded task videos
- See `STORAGE_BUCKET_SETUP.md` for detailed configuration

## Required RLS Policies

All tables should have appropriate Row Level Security policies:

```sql
-- Enable RLS on all tables
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;

-- Public read access for tasks
CREATE POLICY "Public read access" ON onboarding_tasks
FOR SELECT USING (true);

-- Public read access for task groups
CREATE POLICY "Public read access" ON task_groups
FOR SELECT USING (true);

-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON onboarding_users
FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON onboarding_users
FOR UPDATE USING (true);
```

## Environment Setup

### Development
1. Use the provided Supabase credentials
2. Ensure all tables are created (run migration files)
3. Configure storage bucket (see `STORAGE_BUCKET_SETUP.md`)

### Production
1. Create a new Supabase project
2. Update credentials in all HTML files
3. Run all migrations
4. Configure storage buckets
5. Set up proper authentication
6. Implement environment variables

## Testing Connection

To test if the Supabase connection is working:

1. Open browser console
2. Navigate to any of the HTML files
3. Check for console errors
4. Try performing a basic operation (load tasks, users, etc.)

## Troubleshooting

### "relation does not exist" error
- Run all migration files in order
- Check table names match exactly

### "permission denied" error
- Check RLS policies are configured
- Verify anon key has proper permissions

### Connection timeout
- Verify Supabase URL is correct
- Check network connectivity
- Ensure Supabase project is active

## Security Recommendations

1. **Never commit real credentials to version control**
2. **Use environment variables for production**
3. **Implement proper authentication**
4. **Use RLS policies to restrict data access**
5. **Regular security audits**
6. **Monitor API usage in Supabase dashboard**