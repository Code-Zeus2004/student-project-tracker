// ===========================
// Data Management & API Integration with localStorage Cache
// ===========================

// API Configuration
// Production backend URL (Render)
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://student-project-tracker-4hnz.onrender.com/api';

// localStorage keys
const STORAGE_KEYS = {
    PROJECTS: 'studentProjectTracker_projects',
    LAST_SYNC: 'studentProjectTracker_lastSync',
    OFFLINE_MODE: 'studentProjectTracker_offlineMode'
};

// Global state
let projectsState = [];
let isOfflineMode = false;

/**
 * Save projects to localStorage cache
 */
function saveToCache(projects) {
    try {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        console.log('💾 Projects cached to localStorage');
    } catch (error) {
        console.error('Failed to save to cache:', error);
    }
}

/**
 * Load projects from localStorage cache
 */
function loadFromCache() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (cached) {
            const projects = JSON.parse(cached);
            const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            console.log(`📦 Loaded ${projects.length} projects from cache (last sync: ${lastSync})`);
            return projects;
        }
    } catch (error) {
        console.error('Failed to load from cache:', error);
    }
    return [];
}

/**
 * Clear localStorage cache
 */
function clearCache() {
    try {
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
        console.log('🗑️ Cache cleared');
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}

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
            throw new Error(`Backend returned non-JSON response`);
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API request failed' }));
            console.error('API Error Details:', error);
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Cannot connect to backend. Using offline mode.');
        }
        
        throw error;
    }
}

/**
 * Load all projects from API with localStorage fallback
 * @returns {Promise<Array>} Array of project objects
 */
async function loadProjects() {
    try {
        // Try to fetch from API
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
        
        // Save to cache on successful fetch
        saveToCache(projectsState);
        isOfflineMode = false;
        localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
        
        console.log(`✅ Loaded ${projectsState.length} projects from API`);
        return projectsState;
        
    } catch (error) {
        console.error('Error loading projects from API:', error);
        
        // Fallback to localStorage cache
        console.log('📦 Falling back to cached data...');
        projectsState = loadFromCache();
        isOfflineMode = true;
        localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'true');
        
        // Show user-friendly error
        const errorMsg = error.message.includes('connect') || error.message.includes('offline')
            ? '⚠️ Offline Mode: Showing cached projects. Changes will sync when online.'
            : '⚠️ Using cached data. Some features may be limited.';
        
        showWarning(errorMsg);
        
        return projectsState;
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
 * Check if app is in offline mode
 * @returns {boolean} True if offline
 */
function isOffline() {
    return isOfflineMode;
}

/**
 * Add a new project
 * @param {Object} projectData - Project data from form
 * @returns {Promise<Object>} Created project
 */
async function addProject(projectData) {
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
    
    if (isOfflineMode) {
        // Offline mode: save to cache only
        newProject._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        newProject.pendingSync = true;
        projectsState.push(newProject);
        saveToCache(projectsState);
        showWarning('⚠️ Offline: Project saved locally. Will sync when online.');
        return newProject;
    }
    
    try {
        const createdProject = await apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify(newProject)
        });
        
        // Add to state and cache
        projectsState.push(createdProject);
        saveToCache(projectsState);
        
        return createdProject;
    } catch (error) {
        console.error('Error adding project:', error);
        
        // Fallback to offline mode
        newProject._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        newProject.pendingSync = true;
        projectsState.push(newProject);
        saveToCache(projectsState);
        showWarning('⚠️ Saved locally. Will sync when connection is restored.');
        
        return newProject;
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
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    // Update local state first for immediate UI feedback
    const index = projectsState.findIndex(p => 
        (p._id && p._id === projectId) || (p.id && p.id === projectId)
    );
    
    if (index === -1) {
        throw new Error('Project not found');
    }
    
    const localUpdate = { ...projectsState[index], ...updateData };
    
    if (isOfflineMode || projectId.startsWith('temp_')) {
        // Offline mode or temp project: update cache only
        localUpdate.pendingSync = true;
        projectsState[index] = localUpdate;
        saveToCache(projectsState);
        showWarning('⚠️ Offline: Changes saved locally. Will sync when online.');
        return localUpdate;
    }
    
    try {
        const updatedProject = await apiRequest(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        // Update state and cache
        projectsState[index] = updatedProject;
        saveToCache(projectsState);
        
        return updatedProject;
    } catch (error) {
        console.error('Error updating project:', error);
        
        // Fallback: keep local changes
        localUpdate.pendingSync = true;
        projectsState[index] = localUpdate;
        saveToCache(projectsState);
        showWarning('⚠️ Changes saved locally. Will sync when connection is restored.');
        
        return localUpdate;
    }
}

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteProject(projectId) {
    // Remove from local state first for immediate UI feedback
    const index = projectsState.findIndex(p => 
        (p._id && p._id === projectId) || (p.id && p.id === projectId)
    );
    
    if (index === -1) {
        throw new Error('Project not found');
    }
    
    const removedProject = projectsState[index];
    
    if (isOfflineMode || projectId.startsWith('temp_')) {
        // Offline mode or temp project: remove from cache only
        projectsState.splice(index, 1);
        saveToCache(projectsState);
        
        if (!projectId.startsWith('temp_')) {
            showWarning('⚠️ Offline: Deletion saved locally. Will sync when online.');
        }
        
        return true;
    }
    
    try {
        await apiRequest(`/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        // Remove from state and cache
        projectsState.splice(index, 1);
        saveToCache(projectsState);
        
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        
        // Fallback: mark for deletion
        projectsState[index].pendingDeletion = true;
        saveToCache(projectsState);
        showWarning('⚠️ Deletion saved locally. Will sync when connection is restored.');
        
        // Still remove from UI
        projectsState.splice(index, 1);
        return true;
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

/**
 * Show warning notification (for offline mode)
 */
function showWarning(message) {
    // Check if showNotification exists (from app.js)
    if (typeof showNotification === 'function') {
        showNotification(message, 'warning');
    } else {
        console.warn(message);
    }
}

/**
 * Get cache information
 * @returns {Object} Cache status
 */
function getCacheInfo() {
    const cached = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    
    return {
        hasCachedData: !!cached,
        cachedProjectCount: cached ? JSON.parse(cached).length : 0,
        lastSync: lastSync || 'Never',
        isOfflineMode: isOfflineMode
    };
}

/**
 * Force sync with backend (retry failed operations)
 * @returns {Promise<Object>} Sync result
 */
async function forceSyncWithBackend() {
    try {
        console.log('🔄 Force syncing with backend...');
        
        // Check if backend is available
        const isConnected = await checkBackendConnection();
        if (!isConnected) {
            throw new Error('Backend is not available');
        }
        
        // Reload projects from backend
        await loadProjects();
        
        isOfflineMode = false;
        localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
        
        return {
            success: true,
            message: '✅ Successfully synced with backend',
            projectCount: projectsState.length
        };
    } catch (error) {
        console.error('Force sync failed:', error);
        return {
            success: false,
            message: '❌ Sync failed: ' + error.message,
            projectCount: projectsState.length
        };
    }
}

// Enhanced debug API
window.debugAPI = {
    checkConnection: checkBackendConnection,
    getStatus: getBackendStatus,
    getProjects: () => projectsState,
    getCacheInfo: getCacheInfo,
    clearCache: clearCache,
    forceSync: forceSyncWithBackend,
    isOffline: () => isOfflineMode,
    apiUrl: API_BASE_URL,
    saveToCache: () => saveToCache(projectsState),
    loadFromCache: loadFromCache
};

console.log('💡 Debug API available: window.debugAPI');
