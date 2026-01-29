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
    
    // Task management
    document.getElementById('add-task-btn').addEventListener('click', addTaskToForm);
    document.getElementById('new-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTaskToForm();
        }
    });
    
    // AI Description Generator
    document.getElementById('generate-description-btn').addEventListener('click', generateProjectDescription);
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
        deadline: formData.get('deadline'),
        tasks: getTasksFromForm()
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
        clearFormTasks();
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
    
    // Populate tasks
    populateFormTasks(project.tasks || []);
    
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
    clearFormTasks();
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

/**
 * Add task to form
 */
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

/**
 * Remove task from form
 */
function removeTaskFromForm(button) {
    button.parentElement.remove();
}

/**
 * Get tasks from form
 */
function getTasksFromForm() {
    const tasks = [];
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
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

/**
 * Populate form with tasks
 */
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

/**
 * Clear form tasks
 */
function clearFormTasks() {
    document.getElementById('task-list').innerHTML = '';
    document.getElementById('new-task-input').value = '';
}

/**
 * Generate AI-powered project description
 */
function generateProjectDescription() {
    const titleInput = document.getElementById('project-title');
    const subjectInput = document.getElementById('project-subject');
    const descriptionTextarea = document.getElementById('project-description');
    const generateBtn = document.getElementById('generate-description-btn');
    
    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();
    
    if (!title) {
        showError('Please enter a project title first');
        titleInput.focus();
        return;
    }
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <span class="ai-icon spinning">⚡</span>
        <span class="ai-text">Generating...</span>
    `;
    
    // Simulate AI processing delay
    setTimeout(() => {
        try {
            const generatedDescription = generateSmartDescription(title, subject);
            
            // Insert generated text into existing description field
            descriptionTextarea.value = generatedDescription;
            descriptionTextarea.focus();
            
            // Show success feedback
            showSuccess('✨ Description generated! Feel free to edit it.');
            
            // Add visual feedback to the textarea
            descriptionTextarea.classList.add('ai-generated');
            setTimeout(() => {
                descriptionTextarea.classList.remove('ai-generated');
            }, 2000);
            
        } catch (error) {
            showError('Failed to generate description. Please try again.');
        } finally {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <span class="ai-icon">✨</span>
                <span class="ai-text">Generate with AI</span>
            `;
        }
    }, 1500); // Simulate processing time
}

/**
 * Generate smart, domain-specific project description
 */
function generateSmartDescription(title, subject) {
    const analysis = analyzeProjectTitle(title);
    const domain = inferDomainFromTitle(title, subject);
    
    // Get domain-specific generator
    const generator = getDomainGenerator(domain);
    
    // Generate description using domain expertise
    return generator.generate(analysis, title, subject);
}

/**
 * Analyze project title for key components
 */
function analyzeProjectTitle(title) {
    const titleLower = title.toLowerCase();
    
    return {
        originalTitle: title,
        type: detectProjectType(titleLower),
        mainConcepts: extractMainConcepts(title),
        methodology: detectMethodology(titleLower),
        scope: detectScope(titleLower),
        focus: detectFocus(titleLower)
    };
}

/**
 * Extract main concepts from title (preserving original case)
 */
function extractMainConcepts(title) {
    // Split title into meaningful phrases and concepts
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = title.split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.includes(word.toLowerCase())
    );
    
    // Group related concepts
    const concepts = [];
    let currentPhrase = [];
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const nextWord = words[i + 1];
        
        currentPhrase.push(word);
        
        // End phrase if next word starts new concept or we're at the end
        if (!nextWord || isConceptBoundary(word, nextWord)) {
            if (currentPhrase.length > 0) {
                concepts.push(currentPhrase.join(' '));
                currentPhrase = [];
            }
        }
    }
    
    return concepts.slice(0, 3); // Return top 3 concepts
}

/**
 * Determine if there's a concept boundary between words
 */
function isConceptBoundary(word1, word2) {
    const projectTypes = ['analysis', 'study', 'research', 'design', 'implementation', 'evaluation', 'comparison'];
    const methodWords = ['using', 'through', 'via', 'with', 'by'];
    
    return projectTypes.includes(word1.toLowerCase()) || 
           methodWords.includes(word2.toLowerCase()) ||
           (word1.length > 6 && word2.length > 6); // Long words likely different concepts
}

/**
 * Infer academic domain from title and subject
 */
function inferDomainFromTitle(title, subject) {
    const titleLower = title.toLowerCase();
    const subjectLower = subject.toLowerCase();
    
    // Domain indicators in order of specificity
    const domainIndicators = {
        // STEM Fields
        mathematics: ['calculus', 'algebra', 'geometry', 'statistics', 'probability', 'theorem', 'proof', 'equation', 'function', 'derivative', 'integral', 'matrix'],
        physics: ['mechanics', 'thermodynamics', 'quantum', 'relativity', 'electromagnetic', 'optics', 'wave', 'particle', 'energy', 'force', 'motion'],
        chemistry: ['organic', 'inorganic', 'biochemistry', 'molecular', 'reaction', 'synthesis', 'titration', 'spectroscopy', 'catalyst', 'compound'],
        biology: ['genetics', 'evolution', 'ecology', 'anatomy', 'physiology', 'microbiology', 'cell', 'organism', 'species', 'dna', 'protein'],
        computerScience: ['algorithm', 'programming', 'software', 'database', 'network', 'security', 'ai', 'machine learning', 'web', 'app', 'code'],
        engineering: ['design', 'circuit', 'mechanical', 'electrical', 'civil', 'system', 'optimization', 'simulation', 'prototype'],
        
        // Humanities & Social Sciences
        literature: ['shakespeare', 'poetry', 'novel', 'narrative', 'literary', 'author', 'character', 'theme', 'symbolism', 'rhetoric'],
        history: ['war', 'revolution', 'empire', 'civilization', 'ancient', 'medieval', 'renaissance', 'colonial', 'historical', 'timeline'],
        philosophy: ['ethics', 'logic', 'metaphysics', 'epistemology', 'moral', 'argument', 'theory', 'philosophical', 'reasoning'],
        psychology: ['behavior', 'cognitive', 'social', 'developmental', 'personality', 'therapy', 'mental', 'psychological'],
        sociology: ['society', 'culture', 'social', 'community', 'inequality', 'demographic', 'sociological'],
        economics: ['market', 'economy', 'trade', 'finance', 'economic', 'supply', 'demand', 'inflation', 'gdp'],
        
        // Languages
        linguistics: ['language', 'grammar', 'syntax', 'phonetics', 'morphology', 'semantic', 'linguistic'],
        
        // Arts & Creative
        art: ['painting', 'sculpture', 'visual', 'artistic', 'aesthetic', 'gallery', 'museum', 'creative'],
        music: ['composition', 'harmony', 'melody', 'rhythm', 'musical', 'instrument', 'performance'],
        
        // Applied Fields
        business: ['marketing', 'management', 'strategy', 'entrepreneurship', 'business', 'corporate', 'finance'],
        education: ['teaching', 'learning', 'curriculum', 'pedagogy', 'educational', 'classroom'],
        medicine: ['medical', 'clinical', 'patient', 'diagnosis', 'treatment', 'health', 'disease'],
        law: ['legal', 'court', 'justice', 'constitutional', 'criminal', 'civil', 'law']
    };
    
    // Check title and subject for domain indicators
    const combinedText = `${titleLower} ${subjectLower}`;
    
    let bestMatch = 'general';
    let maxMatches = 0;
    
    for (const [domain, keywords] of Object.entries(domainIndicators)) {
        const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = domain;
        }
    }
    
    return bestMatch;
}

/**
 * Extract key concepts from title (preserving original case)
 */
function extractKeywords(titleLower) {
    // This function is kept for backward compatibility but not used in new generator
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'project', 'analysis', 'study', 'research'];
    const words = titleLower.split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.includes(word)
    );
    return words.slice(0, 3); // Top 3 keywords
}

/**
 * Detect project scope
 */
function detectScope(titleLower) {
    if (titleLower.includes('comprehensive') || titleLower.includes('complete') || titleLower.includes('full')) return 'comprehensive';
    if (titleLower.includes('comparative') || titleLower.includes('comparison')) return 'comparative';
    if (titleLower.includes('case study') || titleLower.includes('specific')) return 'focused';
    if (titleLower.includes('survey') || titleLower.includes('overview')) return 'broad';
    return 'standard';
}

/**
 * Detect methodology from title
 */
function detectMethodology(titleLower) {
    if (titleLower.includes('experiment') || titleLower.includes('lab')) return 'experimental';
    if (titleLower.includes('analysis') || titleLower.includes('analyze')) return 'analytical';
    if (titleLower.includes('design') || titleLower.includes('build') || titleLower.includes('create')) return 'constructive';
    if (titleLower.includes('review') || titleLower.includes('survey')) return 'review';
    if (titleLower.includes('simulation') || titleLower.includes('model')) return 'computational';
    return 'investigative';
}

/**
 * Detect focus area from title
 */
function detectFocus(titleLower) {
    if (titleLower.includes('impact') || titleLower.includes('effect')) return 'impact';
    if (titleLower.includes('optimization') || titleLower.includes('improve')) return 'optimization';
    if (titleLower.includes('comparison') || titleLower.includes('versus')) return 'comparison';
    if (titleLower.includes('development') || titleLower.includes('evolution')) return 'development';
    return 'exploration';
}

/**
 * Detect project type from title
 */
function detectProjectType(titleLower) {
    if (titleLower.includes('research') || titleLower.includes('investigation')) {
        return 'research';
    }
    if (titleLower.includes('analysis') || titleLower.includes('analyze')) {
        return 'analysis';
    }
    if (titleLower.includes('essay') || titleLower.includes('paper')) {
        return 'paper';
    }
    if (titleLower.includes('presentation') || titleLower.includes('speech')) {
        return 'presentation';
    }
    if (titleLower.includes('lab') || titleLower.includes('experiment')) {
        return 'experiment';
    }
    if (titleLower.includes('design') || titleLower.includes('build') || titleLower.includes('create') || titleLower.includes('develop')) {
        return 'project';
    }
    if (titleLower.includes('review') || titleLower.includes('survey')) {
        return 'review';
    }
    if (titleLower.includes('study') || titleLower.includes('examination')) {
        return 'study';
    }
    if (titleLower.includes('report')) {
        return 'report';
    }
    
    return 'project';
}

/**
 * Get domain-specific description generator
 */
function getDomainGenerator(domain) {
    const generators = {
        mathematics: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const mainTopic = concepts[0] || 'mathematical concepts';
                
                let description = `This ${analysis.type} focuses on ${mainTopic}`;
                if (concepts.length > 1) {
                    description += ` and explores the relationships between ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` The work employs rigorous mathematical analysis and proof techniques to establish theoretical foundations and derive key results.`;
                } else if (analysis.methodology === 'computational') {
                    description += ` Mathematical modeling and computational methods are used to solve complex problems and validate theoretical predictions.`;
                } else {
                    description += ` The investigation applies mathematical reasoning and problem-solving strategies to develop comprehensive understanding.`;
                }
                
                description += ` The findings contribute to mathematical knowledge and demonstrate proficiency in advanced mathematical concepts.`;
                
                return description;
            }
        },
        
        physics: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const phenomenon = concepts[0] || 'physical phenomena';
                
                let description = `This physics ${analysis.type} investigates ${phenomenon}`;
                if (concepts.length > 1) {
                    description += ` with particular attention to ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'experimental') {
                    description += ` Experimental procedures involve precise measurements, data collection, and statistical analysis to test theoretical predictions.`;
                } else if (analysis.methodology === 'computational') {
                    description += ` Theoretical modeling and computational simulations are employed to understand underlying physical mechanisms.`;
                } else {
                    description += ` The study applies fundamental physical principles and mathematical frameworks to analyze complex systems.`;
                }
                
                description += ` Results provide insights into the nature of physical processes and validate established scientific theories.`;
                
                return description;
            }
        },
        
        chemistry: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const chemicalSystem = concepts[0] || 'chemical systems';
                
                let description = `This chemical ${analysis.type} examines ${chemicalSystem}`;
                if (concepts.length > 1) {
                    description += ` focusing on ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'experimental') {
                    description += ` Laboratory techniques include synthesis, purification, and characterization using modern analytical instruments.`;
                } else if (analysis.methodology === 'analytical') {
                    description += ` Spectroscopic methods and analytical techniques are employed to determine molecular structure and reaction mechanisms.`;
                } else {
                    description += ` The investigation utilizes chemical principles to understand molecular behavior and reaction pathways.`;
                }
                
                description += ` The work advances understanding of chemical processes and demonstrates practical applications in the field.`;
                
                return description;
            }
        },
        
        biology: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const biologicalSystem = concepts[0] || 'biological systems';
                
                let description = `This biological ${analysis.type} explores ${biologicalSystem}`;
                if (concepts.length > 1) {
                    description += ` and examines the interactions between ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'experimental') {
                    description += ` Controlled experiments and biological assays are conducted to test hypotheses and measure biological responses.`;
                } else if (analysis.methodology === 'analytical') {
                    description += ` Data analysis and statistical methods are applied to identify patterns and draw meaningful conclusions from biological data.`;
                } else {
                    description += ` The research employs scientific methodology to investigate life processes and ecological relationships.`;
                }
                
                description += ` Findings contribute to our understanding of living organisms and their complex biological functions.`;
                
                return description;
            }
        },
        
        computerScience: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const technology = concepts[0] || 'computational systems';
                
                let description = `This computer science ${analysis.type} develops ${technology}`;
                if (concepts.length > 1) {
                    description += ` incorporating ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'constructive') {
                    description += ` Software engineering principles guide the design, implementation, and testing phases of development.`;
                } else if (analysis.methodology === 'analytical') {
                    description += ` Algorithm analysis and performance evaluation techniques are used to optimize computational efficiency.`;
                } else {
                    description += ` The project applies computational thinking and programming methodologies to solve complex technical challenges.`;
                }
                
                description += ` The resulting system demonstrates practical applications and advances in computer science technology.`;
                
                return description;
            }
        },
        
        literature: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const literaryWork = concepts[0] || 'literary works';
                
                let description = `This literary ${analysis.type} examines ${literaryWork}`;
                if (concepts.length > 1) {
                    description += ` with focus on ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` Close reading techniques and textual analysis reveal deeper meanings, themes, and literary devices employed by the author.`;
                } else if (analysis.scope === 'comparative') {
                    description += ` Comparative analysis explores similarities and differences across multiple texts within their historical and cultural contexts.`;
                } else {
                    description += ` The study employs critical literary theory to interpret narrative structure, character development, and thematic elements.`;
                }
                
                description += ` The analysis contributes to scholarly understanding of literature and demonstrates advanced interpretive skills.`;
                
                return description;
            }
        },
        
        history: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const historicalTopic = concepts[0] || 'historical events';
                
                let description = `This historical ${analysis.type} investigates ${historicalTopic}`;
                if (concepts.length > 1) {
                    description += ` and analyzes the significance of ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` Primary source documents and historical evidence are critically examined to understand causation and historical context.`;
                } else if (analysis.scope === 'comparative') {
                    description += ` Comparative historical analysis reveals patterns and connections across different time periods and geographical regions.`;
                } else {
                    description += ` The research employs historical methodology to interpret past events and their lasting impact on society.`;
                }
                
                description += ` The work provides valuable insights into historical processes and enhances understanding of the past.`;
                
                return description;
            }
        },
        
        psychology: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const psychologicalTopic = concepts[0] || 'psychological phenomena';
                
                let description = `This psychological ${analysis.type} investigates ${psychologicalTopic}`;
                if (concepts.length > 1) {
                    description += ` and explores relationships with ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'experimental') {
                    description += ` Controlled psychological experiments are designed to test hypotheses about human behavior and cognitive processes.`;
                } else if (analysis.methodology === 'analytical') {
                    description += ` Statistical analysis of behavioral data reveals patterns and correlations in psychological responses.`;
                } else {
                    description += ` The study applies psychological theory and research methods to understand mental processes and behavior.`;
                }
                
                description += ` Results contribute to psychological knowledge and inform evidence-based practices in the field.`;
                
                return description;
            }
        },
        
        economics: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const economicTopic = concepts[0] || 'economic factors';
                
                let description = `This economic ${analysis.type} analyzes ${economicTopic}`;
                if (concepts.length > 1) {
                    description += ` and examines the impact of ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` Economic modeling and statistical analysis are employed to understand market dynamics and economic relationships.`;
                } else {
                    description += ` The research applies economic theory and quantitative methods to analyze complex economic phenomena.`;
                }
                
                description += ` Findings provide insights into economic behavior and inform policy recommendations for real-world applications.`;
                
                return description;
            }
        },
        
        art: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const artisticTopic = concepts[0] || 'artistic elements';
                
                let description = `This artistic ${analysis.type} explores ${artisticTopic}`;
                if (concepts.length > 1) {
                    description += ` through examination of ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` Visual analysis and art historical methods are applied to understand aesthetic principles and cultural significance.`;
                } else if (analysis.methodology === 'constructive') {
                    description += ` Creative practice and artistic techniques are employed to develop original works and explore artistic expression.`;
                } else {
                    description += ` The work investigates artistic concepts through both theoretical study and practical application.`;
                }
                
                description += ` The project demonstrates understanding of artistic traditions and contributes to contemporary artistic discourse.`;
                
                return description;
            }
        },
        
        general: {
            generate: (analysis, title, subject) => {
                const concepts = analysis.mainConcepts;
                const mainTopic = concepts[0] || 'key concepts';
                
                let description = `This academic ${analysis.type} examines ${mainTopic}`;
                if (concepts.length > 1) {
                    description += ` and investigates connections with ${concepts.slice(1).join(' and ')}`;
                }
                description += '.';
                
                if (analysis.methodology === 'analytical') {
                    description += ` Systematic analysis and critical evaluation are employed to develop comprehensive understanding of the subject matter.`;
                } else if (analysis.methodology === 'experimental') {
                    description += ` Empirical investigation and data collection provide evidence-based insights into the research questions.`;
                } else if (analysis.methodology === 'constructive') {
                    description += ` Practical development and implementation demonstrate application of theoretical knowledge to real-world challenges.`;
                } else {
                    description += ` The study applies appropriate research methods to investigate important questions within the discipline.`;
                }
                
                description += ` The work demonstrates mastery of academic skills and contributes meaningful insights to the field of study.`;
                
                return description;
            }
        }
    };
    
    return generators[domain] || generators.general;
}