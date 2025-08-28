# HighLevel Floating Modal Installation Instructions

This system allows your onboarding tasks to open in a persistent floating modal that stays visible as users navigate through different pages in HighLevel.

## What This Does

- Adds a small "open in modal" button to each task in your onboarding interface
- When clicked, opens the task instructions/video in a draggable, resizable floating window
- The modal persists as users navigate through HighLevel (Contacts, Opportunities, etc.)
- Users can minimize the modal to a small bar at the bottom of the screen
- Includes a "Mini Player" mode for just watching the video
- Users can mark tasks complete directly from the modal
- Modal position and state are saved between page loads

## Installation Steps

### Step 1: Install Agency-Level Custom Code

1. **Log into HighLevel** with your agency admin account
2. Navigate to **Settings** → **Custom Code** (or **Agency Settings** → **Custom Code**)
3. Click **"Add Custom Code"** or **"New Script"**

### Step 2: Add the JavaScript

1. **Name:** `Onboarding Task Modal System`
2. **Type:** Select `JavaScript`
3. **Placement:** Select `Body` (important: must be in body, not head)
4. **Pages:** Select `All Pages` or leave blank for all
5. **Code:** Copy and paste the entire contents of `highlevel-agency-modal.js`
6. **Save** the custom code

### Step 3: Add the CSS

1. Click **"Add Custom Code"** again
2. **Name:** `Onboarding Task Modal Styles`
3. **Type:** Select `CSS`
4. **Placement:** Select `Head`
5. **Pages:** Select `All Pages` or leave blank for all
6. **Code:** Copy and paste the entire contents of `highlevel-agency-modal.css`
7. **Save** the custom code

### Step 4: Deploy the Updated Onboarding Page

1. Upload the updated `onboarding.html` to your hosting location
2. The page now includes the "open in modal" button functionality

## How to Use

### For End Users:

1. **Open in Modal:** Hover over any task and click the blue expand icon that appears
2. **Drag:** Click and drag the modal header to move it anywhere on screen
3. **Resize:** Drag the bottom-right corner to resize
4. **Minimize:** Click the minimize button to shrink to a bar at bottom of screen
5. **Mini Player:** Click the picture-in-picture icon to show just the video
6. **Complete Task:** Click "Mark Task as Complete" in the modal
7. **Navigate:** The modal stays open as you move through HighLevel pages

### Features:

- **Persistent:** Modal stays open across page navigation
- **Remembers Position:** Modal returns to last position when reopened
- **Video Continues:** Video keeps playing when minimized
- **Multi-tasking:** Watch instructions while actually doing the work
- **Auto-save:** Progress is saved automatically

## Testing

1. **Open your onboarding page** in a HighLevel custom menu/iframe
2. **Hover over a task** - you should see a blue expand button appear
3. **Click the expand button** - task should open in floating modal
4. **Try dragging** the modal around
5. **Navigate to different pages** in HighLevel - modal should persist
6. **Minimize and restore** - should work smoothly
7. **Mark a task complete** - should update in the onboarding list

## Troubleshooting

### Modal doesn't appear:
- Check that JavaScript is installed in BODY, not HEAD
- Check browser console for errors (F12)
- Ensure custom code is enabled for all pages
- Clear browser cache and refresh

### Modal disappears on navigation:
- Ensure custom code is applied to "All Pages"
- Check that both JS and CSS are installed
- Verify localStorage is not blocked

### Styling looks wrong:
- Make sure CSS is installed in HEAD
- Check for CSS conflicts with HighLevel themes
- Try adding `!important` to CSS rules if needed

### Can't drag or resize:
- Check for JavaScript errors in console
- Ensure no other scripts are interfering
- Try in incognito/private browsing mode

## Customization

### Change Colors:
Edit the gradient colors in the CSS file:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Default Size:
Edit the config in the JS file:
```javascript
const MODAL_CONFIG = {
    defaultWidth: 800,  // Change these values
    defaultHeight: 600
};
```

### Change Minimize Location:
Edit the CSS for `.hl-modal-minimized`:
```css
bottom: 20px;  /* Distance from bottom */
right: 20px;   /* Distance from right */
```

## Security Notes

- The modal only responds to messages from your onboarding app
- No sensitive data is stored in localStorage
- All communication uses postMessage API safely
- Users can only complete their own tasks

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify installation steps were followed correctly
3. Test in different browsers
4. Check HighLevel's custom code documentation for updates

## Files Included

1. **highlevel-agency-modal.js** - Main JavaScript functionality
2. **highlevel-agency-modal.css** - Styling for the modal
3. **onboarding.html** - Updated with modal button functionality
4. **INSTALLATION_INSTRUCTIONS.md** - This file

## Important Notes

- This code runs at the agency level, so it affects all sub-accounts
- Test thoroughly in a development environment first
- The modal persists data in localStorage per domain
- Works best in modern browsers (Chrome, Firefox, Safari, Edge)