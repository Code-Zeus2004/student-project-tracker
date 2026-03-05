// ===========================
// Data Management & API Integration
// ===========================

// API Configuration - UPDATE THIS TO MATCH YOUR BACKEND
const API_BASE_URL = 'http://localhost:5000/api'; // Backend runs on port 5000

// Global state
let projectsState = [];

/**
 * API Helper - Make HTTP requests
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Backend returned HTML instead of JSON. Is your backend running at ${API_BASE_URL}?`);
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API request failed' }));
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Cannot connect to backend. Make sure your server is running.');
        }
        
        throw error;
    }
}

/**
 * Load all projects from API
 * @returns {Promise<Array>} Array of project objects
 */
async function loadProjects() {
    try {
        const data = await apiRequest('/projects');
        
        // Handle different response formats
        if (Array.isArray(data)) {
            projectsState = data;
        } else if (data.projects && Array.isArray(data.projects)) {
            projectsState = data.projects;
        } else if (data.data && Array.isArray(data.data)) {
            projectsState = data.data;
        } else {
            console.warn('Unexpected API response format:', data);
            projectsState = [];
        }
        
        console.log(`Loaded ${projectsState.length} projects from API`);
        return projectsState;
    } catch (error) {
        console.error('Error loading projects:', error);
        
        // Show user-friendly error
        const errorMsg = error.message.includes('backend') || error.message.includes('connect')
            ? 'Cannot connect to backend server. Please start your Node.js server.'
            : 'Failed to load projects. Please try again.';
        
        showError(errorMsg);
        
        // Return empty array to allow app to continue
        projectsState = [];
        return [];
    }
}

/**
 * Get projects from state (synchronous)
 * @returns {Array} Array of project objects
 */
function getProjectsFromState() {
    return projectsState;
}

/**
 * Add a new project
 * @param {Object} projectData - Project data from form
 * @returns {Promise<Object>} Created project
 */
async function addProject(projectData) {
    try {
        const newProject = {
            title: projectData.title,
            description: projectData.description || '',
            subject: projectData.subject || '',
            priority: projectData.priority,
            status: projectData.status,
            deadline: projectData.deadline,
            tasks: projectData.tasks || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const createdProject = await apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify(newProject)
        });
        
        // Add to state
        projectsState.push(createdProject);
        
        return createdProject;
    } catch (error) {
        console.error('Error adding project:', error);
        throw error;
    }
}

/**
 * Get a project by ID
 * @param {string} projectId - Project ID
 * @returns {Object|null} Project object or null
 */
function getProject(projectId) {
    return projectsState.find(p => p._id === projectId || p.id === projectId) || null;
}

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated project or null
 */
async function updateProject(projectId, updates) {
    try {
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        const updatedProject = await apiRequest(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        // Update state
        const index = projectsState.findIndex(p => 
            (p._id && p._id === projectId) || (p.id && p.id === projectId)
        );
        
        if (index !== -1) {
            projectsState[index] = updatedProject;
        }
        
        return updatedProject;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteProject(projectId) {
    try {
        await apiRequest(`/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        // Remove from state
        projectsState = projectsState.filter(p => 
            (p._id && p._id !== projectId) && (p.id && p.id !== projectId)
        );
        
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

/**
 * Get filtered and sorted projects
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered projects
 */
function getFilteredProjects(filters = {}) {
    let projects = [...projectsState];
    
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
    const projects = projectsState;
    
    return {
        total: projects.length,
        notStarted: projects.filter(p => p.status === 'not-started').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        overdue: projects.filter(p => isOverdue(p.deadline, p.status)).length
    };
}

/**
 * Sync projects with backend (refresh from API)
 * @returns {Promise<Array>} Updated projects array
 */
async function syncProjects() {
    try {
        return await loadProjects();
    } catch (error) {
        console.error('Error syncing projects:', error);
        return projectsState;
    }
}

/**
 * Check if backend is available
 * @returns {Promise<boolean>} True if backend is reachable
 */
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'HEAD',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok || response.status === 404; // 404 means server is running but endpoint might be different
    } catch (error) {
        return false;
    }
}

/**
 * Get backend status for debugging
 * @returns {Promise<Object>} Status information
 */
async function getBackendStatus() {
    const isConnected = await checkBackendConnection();
    return {
        url: API_BASE_URL,
        connected: isConnected,
        projectCount: projectsState.length,
        message: isConnected 
            ? 'Backend is connected' 
            : `Backend not reachable at ${API_BASE_URL}. Please start your server.`
    };
}

// Export for debugging in console
window.debugAPI = {
    checkConnection: checkBackendConnection,
    getStatus: getBackendStatus,
    getProjects: () => projectsState,
    apiUrl: API_BASE_URL
};
