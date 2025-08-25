# HighLevel Funnel Builder Setup Guide

## Clean URL Configuration

This application is configured to work with clean URLs (without .html extensions) for better user experience and SEO.

## Setup Instructions for HighLevel

### 1. Page Structure
Create the following pages in your HighLevel funnel:
- `/admin` - Main admin dashboard (upload admin.html)
- `/analytics` - User analytics page (upload analytics.html)
- `/onboarding` - User onboarding page (upload onboarding.html)
- `/test` - System test page (upload test.html - optional)

### 2. URL Configuration
When creating pages in HighLevel:
1. Set the page URL slug to match the page name without extension:
   - admin.html → URL slug: `admin`
   - analytics.html → URL slug: `analytics`
   - onboarding.html → URL slug: `onboarding`

### 3. Navigation Setup
The navigation system automatically detects the root domain and constructs clean URLs:
- Uses `/admin` instead of `/admin.html`
- Maintains subfolder structure if deployed in a subdirectory
- Handles both custom domains and HighLevel subdomains

### 4. File Upload Instructions
1. In HighLevel, go to Sites → Funnels & Websites
2. Create a new funnel or edit existing one
3. For each page:
   - Click "Add New Step"
   - Set the path (e.g., `/admin`)
   - Upload the corresponding HTML file
   - Save the page

### 5. Custom Domain Setup (Optional)
If using a custom domain:
1. The system will automatically detect the domain
2. Navigation will use your custom domain with clean paths
3. Example: `https://yourdomain.com/admin`

### 6. Testing
After setup, test navigation:
1. Go to your main URL (it should load `/admin` by default)
2. Click through navigation links
3. Verify all pages load without .html extensions

## Technical Details

### URL Detection
The application includes smart URL detection that:
- Identifies the current domain (custom or HighLevel subdomain)
- Maintains folder structure if in a subdirectory
- Constructs appropriate clean URLs for navigation

### Navigation Function
```javascript
// The app uses this function to generate clean URLs
function getCleanUrl(page) {
    // Removes .html and handles routing
    // Works with both root and subfolder deployments
}
```

### Browser Compatibility
- Works with all modern browsers
- Handles both hash-based and path-based routing
- Compatible with HighLevel's funnel builder system

## Troubleshooting

### Issue: Pages showing 404
**Solution**: Ensure page slugs in HighLevel match exactly (without .html):
- ✅ Correct: `/admin`
- ❌ Wrong: `/admin.html`

### Issue: Navigation not working
**Solution**: Check that all pages are published in HighLevel and accessible

### Issue: Styles not loading
**Solution**: Ensure all CSS and JavaScript resources are properly uploaded with the HTML files

## Support Files

### .htaccess (for Apache servers)
If hosting outside HighLevel on Apache, use the included `.htaccess` file for URL rewriting.

### Direct File Access
If you need to access files directly during development:
- Add `.html` to the URL manually
- The system will still function normally

## Contact
For additional support with HighLevel integration, refer to HighLevel's documentation or support team.