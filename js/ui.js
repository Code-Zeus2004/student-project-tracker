// ===========================
// UI Rendering Functions
// ===========================

/**
 * Update statistics display
 */
function updateStats() {
    const stats = getProjectStats();
    
    document.getElementById('total-projects').textContent = stats.total;
    document.getElementById('in-progress-count').textContent = stats.inProgress;
    document.getElementById('completed-count').textContent = stats.completed;
    document.getElementById('overdue-count').textContent = stats.overdue;
    
    updateProgressRing(stats);
}

/**
 * Update circular progress ring
 */
function updateProgressRing(stats) {
    const percentage = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
    
    const circle = document.getElementById('progress-ring-circle');
    const text = document.getElementById('ring-percentage');
    
    if (!circle || !text) return;
    
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    text.textContent = `${percentage}%`;
}

/**
 * Create project card HTML
 */
function createProjectCard(project) {
    const statusText = getStatusText(project);
    const statusClass = getStatusClass(project);
    const priorityClass = getPriorityClass(project.priority);
    const priorityCapitalized = project.priority.charAt(0).toUpperCase() + project.priority.slice(1);
    
    return `
        <article class="project-card" data-project-id="${project.id}" role="listitem">
            <div class="project-header">
                <h3 class="project-title">${escapeHtml(project.title)}</h3>
                <span class="priority-badge ${priorityClass}">${priorityCapitalized}</span>
            </div>
            
            ${project.subject ? `<p class="project-subject">📚 ${escapeHtml(project.subject)}</p>` : ''}
            
            ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
            
            <div class="project-meta">
                <div class="meta-item">
                    <span class="meta-label">📅 Deadline</span>
                    <time class="meta-value" datetime="${project.deadline}">${formatDate(project.deadline)}</time>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Status</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
            
            <div class="project-actions">
                <select class="status-select" data-project-id="${project.id}" aria-label="Change status">
                    <option value="not-started" ${project.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                    <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button class="btn-edit" data-project-id="${project.id}" aria-label="Edit">✏️</button>
                <button class="btn-delete" data-project-id="${project.id}" aria-label="Delete">🗑️</button>
            </div>
        </article>
    `;
}

/**
 * Render all projects
 */
function renderProjects(filters = {}) {
    const container = document.getElementById('projects-container');
    const projects = getFilteredProjects(filters);
    
    if (projects.length === 0) {
        const hasFilters = filters.status !== 'all' || filters.priority !== 'all';
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>${hasFilters ? 'No projects match your filters' : 'No projects yet'}</h3>
                <p>${hasFilters ? 'Try adjusting your filters' : 'Click the + button to create your first project'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => createProjectCard(project)).join('');
    attachProjectEventListeners();
}

/**
 * Attach event listeners to project cards
 */
function attachProjectEventListeners() {
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusChange);
    });
    
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', handleEditProject);
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', handleDeleteProject);
    });
}

/**
 * Handle project edit
 */
function handleEditProject(event) {
    const projectId = event.target.dataset.projectId;
    startEditProject(projectId);
}

/**
 * Handle status change
 */
function handleStatusChange(event) {
    const projectId = event.target.dataset.projectId;
    const newStatus = event.target.value;
    const project = getProject(projectId);
    
    if (!project) return;
    
    updateProject(projectId, { status: newStatus });
    
    announceToScreenReader(`Project "${project.title}" status changed to ${newStatus.replace('-', ' ')}`);
    
    const filters = getCurrentFilters();
    renderProjects(filters);
    updateStats();
}

/**
 * Handle project deletion
 */
function handleDeleteProject(event) {
    const projectId = event.target.dataset.projectId;
    const project = getProject(projectId);
    
    if (!project) return;
    
    const confirmed = confirm(`Delete "${project.title}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        deleteProject(projectId);
        
        const filters = getCurrentFilters();
        renderProjects(filters);
        updateStats();
        
        showSuccess('🗑️ Project deleted');
    }
}

/**
 * Get current filter values
 */
function getCurrentFilters() {
    return {
        status: document.getElementById('filter-status').value,
        priority: document.getElementById('filter-priority').value,
        sortBy: document.getElementById('sort-by').value
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}
