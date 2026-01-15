// ===========================
// Utility Functions
// ===========================

/**
 * Generate a unique ID for projects
 * @returns {string} Unique ID with timestamp
 */
function generateId() {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate days until deadline
 * @param {string} deadline - ISO date string
 * @returns {number} Days remaining (negative if overdue)
 */
function daysUntilDeadline(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Check if project is overdue
 * @param {string} deadline - ISO date string
 * @param {string} status - Current project status
 * @returns {boolean} True if overdue
 */
function isOverdue(deadline, status) {
    if (status === 'completed') return false;
    return daysUntilDeadline(deadline) < 0;
}

/**
 * Get status display text with deadline info
 * @param {Object} project - Project object
 * @returns {string} Status text
 */
function getStatusText(project) {
    if (isOverdue(project.deadline, project.status)) {
        return 'Overdue';
    }
    
    const days = daysUntilDeadline(project.deadline);
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    if (days > 0 && days <= 7) return `${days} days left`;
    
    return project.status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Get CSS class for status badge
 * @param {Object} project - Project object
 * @returns {string} CSS class name
 */
function getStatusClass(project) {
    if (isOverdue(project.deadline, project.status)) {
        return 'status-overdue';
    }
    return `status-${project.status}`;
}

/**
 * Get CSS class for priority badge
 * @param {string} priority - Priority level
 * @returns {string} CSS class name
 */
function getPriorityClass(priority) {
    return `priority-${priority}`;
}
