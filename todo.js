class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.filter = 'all';
    this.init();
  }
  
  init() {
    this.setupElements();
    this.attachEventListeners();
    this.render();
  }
  
  setupElements() {
    this.taskInput = document.getElementById('taskInput');
    this.prioritySelect = document.getElementById('prioritySelect');
    this.addBtn = document.getElementById('addBtn');
    this.tasksList = document.getElementById('tasksList');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.progressBar = document.getElementById('progressBar');
    this.completedCount = document.getElementById('completedCount');
    this.totalCount = document.getElementById('totalCount');
  }
  
  attachEventListeners() {
    this.addBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = btn.dataset.filter;
        this.render();
      });
    });
  }
  
  addTask() {
    const text = this.taskInput.value.trim();
    const priority = this.prioritySelect.value;
    
    if (!text) return;
    
    const task = {
      id: Date.now(),
      text,
      priority,
      completed: false,
      createdAt: new Date().toLocaleDateString('fr-FR')
    };
    
    this.tasks.unshift(task);
    this.saveTasks();
    this.taskInput.value = '';
    this.render();
  }
  
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }
  
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.render();
  }
  
  getFilteredTasks() {
    return this.tasks.filter(task => {
      if (this.filter === 'all') return true;
      if (this.filter === 'pending') return !task.completed;
      if (this.filter === 'completed') return task.completed;
      if (this.filter === 'high') return task.priority === 'high';
      return true;
    });
  }
  
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    this.progressBar.style.width = percentage + '%';
  }
  
  render() {
    const filtered = this.getFilteredTasks();
    this.updateStats();
    
    if (filtered.length === 0) {
      this.tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>Aucune tâche ici.<br>Ajoutez-en une pour commencer!</p>
        </div>
      `;
      return;
    }
    
    this.tasksList.innerHTML = filtered.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}">
        <button class="checkbox" data-id="${task.id}"></button>
        <div class="task-content">
          <p class="task-text">${this.escapeHtml(task.text)}</p>
          <div class="task-meta">
            <span class="task-priority priority-${task.priority}">${this.getPriorityLabel(task.priority)}</span>
            <span class="task-date">${task.createdAt}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-delete" data-id="${task.id}">Suppr.</button>
        </div>
      </div>
    `).join('');
    
    // Attach events
    this.tasksList.querySelectorAll('.checkbox').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTask(parseInt(btn.dataset.id)));
    });
    
    this.tasksList.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTask(parseInt(btn.dataset.id)));
    });
  }
  
  getPriorityLabel(priority) {
    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute'
    };
    return labels[priority] || priority;
  }
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  saveTasks() {
    try {
      localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  }
  
  loadTasks() {
    try {
      const data = localStorage.getItem('todoTasks');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      return [];
    }
  }
}

// Initialiser l'app
const app = new TodoApp();