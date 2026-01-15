// ===========================
// Main Application Logic
// ===========================

let editingProjectId = null;

/**
 * Initialize the application
 */
function initApp() {
    console.log('🚀 Project Tracker initialized');
    
    // Initial render
    renderProjects(getCurrentFilters());
    updateStats();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set minimum date for deadline input to today
    const deadlineInput = document.getElementById('project-deadline');
    const today = new Date().toISOString().split('T')[0];
    deadlineInput.setAttribute('min', today);
    
    // Load theme preference
    loadTheme();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // FAB button to show form
    document.getElementById('fab-add').addEventListener('click', showForm);
    
    // Close form button
    document.getElementById('close-form').addEventListener('click', hideForm);
    
    // Close form when clicking outside
    document.getElementById('add-project').addEventListener('click', (e) => {
        if (e.target.id === 'add-project') {
            hideForm();
        }
    });
    
    // Form submission
    document.getElementById('project-form').addEventListener('submit', handleFormSubmit);
    
    // Filter changes
    document.getElementById('filter-status').addEventListener('change', handleFilterChange);
    document.getElementById('filter-priority').addEventListener('change', handleFilterChange);
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

/**
 * Show the form modal
 */
function showForm() {
    document.getElementById('add-project').style.display = 'flex';
    document.getElementById('project-title').focus();
}

/**
 * Hide the form modal
 */
function hideForm() {
    document.getElementById('add-project').style.display = 'none';
    if (editingProjectId) {
        cancelEdit();
    }
}

/**
 * Toggle theme
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const icon = document.querySelector('.theme-icon');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

/**
 * Load theme preference
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = document.querySelector('.theme-icon');
    icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        subject: formData.get('subject').trim(),
        priority: formData.get('priority'),
        status: formData.get('status'),
        deadline: formData.get('deadline')
    };
    
    const validation = validateProjectData(projectData);
    if (!validation.valid) {
        showError(validation.errors.join('\n'));
        return;
    }
    
    try {
        if (editingProjectId) {
            const updatedProject = updateProject(editingProjectId, projectData);
            if (updatedProject) {
                showSuccess('✨ Project updated!');
                cancelEdit();
            } else {
                throw new Error('Project not found');
            }
        } else {
            addProject(projectData);
            showSuccess('🎉 Project created!');
        }
        
        form.reset();
        hideForm();
        
        const filters = getCurrentFilters();
        renderProjects(filters);
        updateStats();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showError('Failed to save project. Please try again.');
    }
}

/**
 * Validate project data
 */
function validateProjectData(data) {
    const errors = [];
    
    if (!data.title || data.title.length === 0) {
        errors.push('Project title is required');
    } else if (data.title.length > 100) {
        errors.push('Title must be less than 100 characters');
    }
    
    if (data.description && data.description.length > 500) {
        errors.push('Description must be less than 500 characters');
    }
    
    if (data.subject && data.subject.length > 50) {
        errors.push('Subject must be less than 50 characters');
    }
    
    if (!data.priority || !['low', 'medium', 'high'].includes(data.priority)) {
        errors.push('Please select a priority');
    }
    
    if (!data.status || !['not-started', 'in-progress', 'completed'].includes(data.status)) {
        errors.push('Please select a status');
    }
    
    if (!data.deadline) {
        errors.push('Deadline is required');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Start editing a project
 */
function startEditProject(projectId) {
    const project = getProject(projectId);
    if (!project) {
        showError('Project not found');
        return;
    }
    
    editingProjectId = projectId;
    
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-subject').value = project.subject || '';
    document.getElementById('project-deadline').value = project.deadline;
    
    // Set priority radio
    document.getElementById(`priority-${project.priority}`).checked = true;
    
    // Set status radio
    document.getElementById(`status-${project.status}`).checked = true;
    
    // Update form heading
    document.getElementById('form-heading').textContent = '✏️ Edit Project';
    document.querySelector('.btn-primary .btn-text').textContent = 'Update Project';
    
    showForm();
}

/**
 * Cancel edit mode
 */
function cancelEdit() {
    editingProjectId = null;
    document.getElementById('project-form').reset();
    document.getElementById('form-heading').textContent = '✏️ New Project';
    document.querySelector('.btn-primary .btn-text').textContent = 'Add Project';
}

/**
 * Show error notification
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * Show success notification
 */
function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('notification-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Handle filter/sort changes
 */
function handleFilterChange() {
    const filters = getCurrentFilters();
    renderProjects(filters);
}

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}