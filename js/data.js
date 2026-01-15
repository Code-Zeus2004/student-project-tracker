// ===========================
// Data Management & LocalStorage
// ===========================

const STORAGE_KEY = 'studentProjectTracker_projects';

/**
 * Load projects from localStorage
 * @returns {Array} Array of project objects
 */
function loadProjects() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

/**
 * Save projects to localStorage
 * @param {Array} projects - Array of project objects
 */
function saveProjects(projects) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error('Error saving projects:', error);
        alert('Failed to save projects. Storage might be full.');
    }
}

/**
 * Add a new project
 * @param {Object} projectData - Project data from form
 * @returns {Object} Created project
 */
function addProject(projectData) {
    const projects = loadProjects();
    
    const newProject = {
        id: generateId(),
        title: projectData.title,
        description: projectData.description || '',
        subject: projectData.subject || '',
        priority: projectData.priority,
        status: projectData.status,
        deadline: projectData.deadline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: []
    };
    
    projects.push(newProject);
    saveProjects(projects);
    
    return newProject;
}

/**
 * Get a project by ID
 * @param {string} projectId - Project ID
 * @returns {Object|null} Project object or null
 */
function getProject(projectId) {
    const projects = loadProjects();
    return projects.find(p => p.id === projectId) || null;
}

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated project or null
 */
function updateProject(projectId, updates) {
    const projects = loadProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) return null;
    
    projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    saveProjects(projects);
    return projects[index];
}

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {boolean} True if deleted successfully
 */
function deleteProject(projectId) {
    const projects = loadProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) {
        return false; // Project not found
    }
    
    saveProjects(filteredProjects);
    return true;
}

/**
 * Get filtered and sorted projects
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered projects
 */
function getFilteredProjects(filters = {}) {
    let projects = loadProjects();
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
            projects = projects.filter(p => isOverdue(p.deadline, p.status));
        } else {
            projects = projects.filter(p => p.status === filters.status);
        }
    }
    
    // Apply priority filter
    if (filters.priority && filters.priority !== 'all') {
        projects = projects.filter(p => p.priority === filters.priority);
    }
    
    // Apply sorting
    if (filters.sortBy) {
        projects.sort((a, b) => {
            switch (filters.sortBy) {
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                default:
                    return 0;
            }
        });
    }
    
    return projects;
}

/**
 * Get project statistics
 * @returns {Object} Statistics object
 */
function getProjectStats() {
    const projects = loadProjects();
    
    return {
        total: projects.length,
        notStarted: projects.filter(p => p.status === 'not-started').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        overdue: projects.filter(p => isOverdue(p.deadline, p.status)).length
    };
}
