// ===========================
// Main Application Logic
// ===========================

let editingProjectId = null;
let isLoading = false;

/**
 * Initialize the application
 */
async function initApp() {
    console.log('🚀 Project Tracker initialized');
    
    // Show loading state
    showLoadingState();
    
    try {
        // Load projects from API
        await loadProjects();
        
        // Initial render
        renderProjects(getCurrentFilters());
        updateStats();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load projects. Please check your backend connection.');
    } finally {
        hideLoadingState();
    }
    
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
 * Show loading state
 */
function showLoadingState() {
    isLoading = true;
    const container = document.getElementById('projects-container');
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading projects...</p>
        </div>
    `;
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    isLoading = false;
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    document.getElementById('fab-add').addEventListener('click', showForm);
    document.getElementById('close-form').addEventListener('click', hideForm);
    document.getElementById('add-project').addEventListener('click', (e) => {
        if (e.target.id === 'add-project') hideForm();
    });
    document.getElementById('project-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('filter-status').addEventListener('change', handleFilterChange);
    document.getElementById('filter-priority').addEventListener('change', handleFilterChange);
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('add-task-btn').addEventListener('click', addTaskToForm);
    document.getElementById('new-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTaskToForm();
        }
    });
}

function showForm() {
    document.getElementById('add-project').style.display = 'flex';
    document.getElementById('project-title').focus();
}

function hideForm() {
    document.getElementById('add-project').style.display = 'none';
    if (editingProjectId) cancelEdit();
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.setItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

async function handleFormSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    
    const form = event.target;
    const formData = new FormData(form);
    
    const projectData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        subject: formData.get('subject').trim(),
        priority: formData.get('priority'),
        status: formData.get('status'),
        deadline: formData.get('deadline'),
        tasks: getTasksFromForm()
    };
    
    const validation = validateProjectData(projectData);
    if (!validation.valid) {
        showError(validation.errors.join('\n'));
        return;
    }
    
    isLoading = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="ai-icon spinning">⚡</span><span class="ai-text">Saving...</span>';
    
    try {
        if (editingProjectId) {
            await updateProject(editingProjectId, projectData);
            showSuccess('✨ Project updated!');
            cancelEdit();
        } else {
            await addProject(projectData);
            showSuccess('� Project created!');
        }
        
        form.reset();
        clearFormTasks();
        hideForm();
        renderProjects(getCurrentFilters());
        updateStats();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showError('Failed to save project. Please try again.');
    } finally {
        isLoading = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function validateProjectData(data) {
    const errors = [];
    if (!data.title || data.title.length === 0) errors.push('Project title is required');
    else if (data.title.length > 100) errors.push('Title must be less than 100 characters');
    if (data.description && data.description.length > 500) errors.push('Description must be less than 500 characters');
    if (data.subject && data.subject.length > 50) errors.push('Subject must be less than 50 characters');
    if (!data.priority || !['low', 'medium', 'high'].includes(data.priority)) errors.push('Please select a priority');
    if (!data.status || !['not-started', 'in-progress', 'completed'].includes(data.status)) errors.push('Please select a status');
    if (!data.deadline) errors.push('Deadline is required');
    return { valid: errors.length === 0, errors: errors };
}

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
    document.getElementById(`priority-${project.priority}`).checked = true;
    document.getElementById(`status-${project.status}`).checked = true;
    populateFormTasks(project.tasks || []);
    document.getElementById('form-heading').textContent = '✏️ Edit Project';
    document.querySelector('.btn-primary .btn-text').textContent = 'Update Project';
    showForm();
}

function cancelEdit() {
    editingProjectId = null;
    document.getElementById('project-form').reset();
    clearFormTasks();
    document.getElementById('form-heading').textContent = '✏️ New Project';
    document.querySelector('.btn-primary .btn-text').textContent = 'Add Project';
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

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

function handleFilterChange() {
    renderProjects(getCurrentFilters());
}

// Task Management
function addTaskToForm() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();
    if (!taskText) return;
    
    const taskList = document.getElementById('task-list');
    const taskId = `task_${Date.now()}`;
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
        <input type="checkbox" id="${taskId}" class="task-checkbox">
        <label for="${taskId}" class="task-label">${escapeHtml(taskText)}</label>
        <button type="button" class="btn-remove-task" onclick="removeTaskFromForm(this)">×</button>
    `;
    taskList.appendChild(taskElement);
    input.value = '';
}

function removeTaskFromForm(button) {
    button.parentElement.remove();
}

function getTasksFromForm() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(item => {
        const checkbox = item.querySelector('.task-checkbox');
        const label = item.querySelector('.task-label');
        tasks.push({
            id: checkbox.id,
            text: label.textContent,
            completed: checkbox.checked
        });
    });
    return tasks;
}

function populateFormTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <input type="checkbox" id="${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <label for="${task.id}" class="task-label">${escapeHtml(task.text)}</label>
            <button type="button" class="btn-remove-task" onclick="removeTaskFromForm(this)">×</button>
        `;
        taskList.appendChild(taskElement);
    });
}

function clearFormTasks() {
    document.getElementById('task-list').innerHTML = '';
    document.getElementById('new-task-input').value = '';
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
