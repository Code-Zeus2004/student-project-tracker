# Testing Checklist ✅

Use this checklist to verify all features are working correctly.

## Prerequisites
- [ ] Backend server is running (`cd backend && npm start`)
- [ ] You see "Server running on port 5000" and "MongoDB Connected"
- [ ] Frontend is open in browser (index.html)
- [ ] No console errors (press F12 to check)

## Basic Functionality

### Creating Projects
- [ ] Click the **+** (FAB) button
- [ ] Modal form appears with backdrop blur
- [ ] Fill in project title: "Test Project"
- [ ] Click **✨ Generate with AI** button
- [ ] AI generates a description based on the title
- [ ] Select priority (Low/Medium/High)
- [ ] Select status (Not Started/In Progress/Completed)
- [ ] Set a deadline date
- [ ] Click **Add Project**
- [ ] Project appears in the list
- [ ] Statistics update (Total Projects count increases)

### Editing Projects
- [ ] Click the **✏️** (edit) button on a project card
- [ ] Form opens with project data pre-filled
- [ ] Form heading shows "✏️ Edit Project"
- [ ] Button text shows "Update Project"
- [ ] Modify the title or description
- [ ] Click **Update Project**
- [ ] Changes are saved and visible
- [ ] Modal closes automatically

### Deleting Projects
- [ ] Click the **🗑️** (delete) button on a project card
- [ ] Confirmation dialog appears
- [ ] Click OK to confirm
- [ ] Project is removed from the list
- [ ] Statistics update (Total Projects count decreases)
- [ ] Success notification appears

### Status Changes
- [ ] Use the dropdown on a project card
- [ ] Change status (Not Started → In Progress → Completed)
- [ ] Status badge updates immediately
- [ ] Statistics update (In Progress/Completed counts change)
- [ ] Progress ring updates

## Advanced Features

### Task Management
- [ ] Open the form to create/edit a project
- [ ] Type a task in "Add a task" input
- [ ] Click **+ Add Task** button
- [ ] Task appears in the task list
- [ ] Add multiple tasks
- [ ] Check/uncheck task checkboxes
- [ ] Remove tasks using the **×** button
- [ ] Save project with tasks
- [ ] Tasks appear on the project card (if implemented)

### AI Description Generator
- [ ] Create a new project with title "Machine Learning Classification"
- [ ] Click **✨ Generate with AI**
- [ ] Description mentions computer science/ML concepts
- [ ] Create another project: "Shakespeare's Hamlet Analysis"
- [ ] Generate description
- [ ] Description uses literary terminology
- [ ] Try different domains (Math, Physics, History, etc.)
- [ ] Each generates domain-appropriate content

### Filtering & Sorting
- [ ] Create projects with different statuses
- [ ] Use **Filter by Status** dropdown
- [ ] Select "In Progress" - only in-progress projects show
- [ ] Select "Completed" - only completed projects show
- [ ] Create projects with different priorities
- [ ] Use **Filter by Priority** dropdown
- [ ] Select "High" - only high-priority projects show
- [ ] Use **Sort by** dropdown
- [ ] Try "Deadline" - projects sort by date
- [ ] Try "Title" - projects sort alphabetically
- [ ] Try "Priority" - high priority projects appear first

### Statistics & Progress
- [ ] Check the stats section shows correct counts
- [ ] Total Projects matches the number of cards
- [ ] In Progress count is accurate
- [ ] Completed count is accurate
- [ ] Overdue count shows projects past deadline
- [ ] Circular progress ring shows correct percentage
- [ ] Create a completed project - percentage increases
- [ ] Delete a project - statistics update immediately

### Theme Toggle
- [ ] Click the theme toggle button (🌙/☀️)
- [ ] Theme switches between light and dark
- [ ] All colors change appropriately
- [ ] Icon changes (🌙 for light mode, ☀️ for dark mode)
- [ ] Preference is saved (refresh page to verify)

### Responsive Design
- [ ] Resize browser window to mobile size (< 768px)
- [ ] Layout adapts to smaller screen
- [ ] Form is still usable
- [ ] Project cards stack vertically
- [ ] All buttons are accessible
- [ ] Text is readable

## Data Persistence

### Backend Integration
- [ ] Create a project
- [ ] Refresh the page (F5)
- [ ] Project is still there (loaded from database)
- [ ] Edit a project
- [ ] Refresh the page
- [ ] Changes are persisted
- [ ] Delete a project
- [ ] Refresh the page
- [ ] Project stays deleted

### Error Handling
- [ ] Stop the backend server (Ctrl+C in terminal)
- [ ] Try to create a project
- [ ] Error message appears: "Cannot connect to backend"
- [ ] Try to edit a project
- [ ] Error message appears
- [ ] Restart backend server
- [ ] Refresh the page
- [ ] Everything works again

## Browser Console Tests

Open browser console (F12) and run these commands:

```javascript
// Check backend connection
await window.debugAPI.checkConnection()
// Should return: true

// Get backend status
await window.debugAPI.getStatus()
// Should show: { url: "http://localhost:5000/api", connected: true, ... }

// View current projects
window.debugAPI.getProjects()
// Should show array of projects

// View API URL
window.debugAPI.apiUrl
// Should show: "http://localhost:5000/api"
```

## Performance Checks
- [ ] Page loads in under 2 seconds
- [ ] No lag when creating projects
- [ ] Smooth animations (progress ring, cards)
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools Performance tab)

## Accessibility
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Form labels are associated with inputs
- [ ] Buttons have descriptive text/aria-labels
- [ ] Status changes are announced (screen reader)
- [ ] Color contrast is sufficient

## Edge Cases

### Empty States
- [ ] Delete all projects
- [ ] Empty state message appears
- [ ] Message says "No projects yet"
- [ ] Helpful text: "Click the + button to create..."

### Validation
- [ ] Try to submit form with empty title
- [ ] Error message appears
- [ ] Try to submit with very long title (>100 chars)
- [ ] Error message appears
- [ ] Try to submit without selecting priority
- [ ] Error message appears
- [ ] Try to submit without deadline
- [ ] Error message appears

### Special Characters
- [ ] Create project with title: "Test & <Special> Characters"
- [ ] Characters are properly escaped (no HTML injection)
- [ ] Project displays correctly

## Final Verification

- [ ] All features work without errors
- [ ] Data persists across page refreshes
- [ ] UI is responsive and looks good
- [ ] No console errors
- [ ] Backend connection is stable
- [ ] Statistics are always accurate

## If Any Test Fails

1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify backend is running on port 5000
4. Check `FIXES_APPLIED.md` for troubleshooting
5. Verify MongoDB Atlas connection is working

---

**All tests passing?** 🎉 Your Student Project Tracker is fully functional!
