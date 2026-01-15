// Todo List Application

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

class TodoApp {
  private todos: Todo[] = [];
  private currentFilter: FilterType = 'all';
  private readonly STORAGE_KEY = 'kbdc-todos';

  // DOM Elements
  private todoForm: HTMLFormElement;
  private todoInput: HTMLInputElement;
  private todoList: HTMLUListElement;
  private emptyState: HTMLElement;
  private todoCount: HTMLElement;
  private clearCompletedBtn: HTMLElement;
  private clearCompletedContainer: HTMLElement;
  private filterButtons: NodeListOf<HTMLButtonElement>;

  constructor() {
    // Get DOM elements
    this.todoForm = document.getElementById('todo-form') as HTMLFormElement;
    this.todoInput = document.getElementById('todo-input') as HTMLInputElement;
    this.todoList = document.getElementById('todo-list') as HTMLUListElement;
    this.emptyState = document.getElementById('empty-state') as HTMLElement;
    this.todoCount = document.getElementById('todo-count') as HTMLElement;
    this.clearCompletedBtn = document.getElementById('clear-completed') as HTMLElement;
    this.clearCompletedContainer = document.getElementById('clear-completed-container') as HTMLElement;
    this.filterButtons = document.querySelectorAll('.filter-btn');

    this.init();
  }

  private init(): void {
    // Load todos from localStorage
    this.loadTodos();

    // Setup event listeners
    this.todoForm.addEventListener('submit', this.handleAddTodo.bind(this));
    this.clearCompletedBtn.addEventListener('click', this.clearCompleted.bind(this));

    // Setup filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') as FilterType;
        this.setFilter(filter);
      });
    });

    // Initial render
    this.render();
  }

  private handleAddTodo(e: Event): void {
    e.preventDefault();

    const text = this.todoInput.value.trim();
    if (!text) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date()
    };

    this.todos.unshift(newTodo);
    this.todoInput.value = '';
    this.saveTodos();
    this.render();
  }

  private toggleTodo(id: string): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  private deleteTodo(id: string): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }

  private clearCompleted(): void {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
    this.render();
  }

  private setFilter(filter: FilterType): void {
    this.currentFilter = filter;

    // Update button styles
    this.filterButtons.forEach(btn => {
      if (btn.getAttribute('data-filter') === filter) {
        btn.className = 'filter-btn px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white';
      } else {
        btn.className = 'filter-btn px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300';
      }
    });

    this.render();
  }

  private getFilteredTodos(): Todo[] {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  private render(): void {
    const filteredTodos = this.getFilteredTodos();

    // Show/hide empty state
    if (filteredTodos.length === 0) {
      this.todoList.classList.add('hidden');
      this.emptyState.classList.remove('hidden');
    } else {
      this.todoList.classList.remove('hidden');
      this.emptyState.classList.add('hidden');
    }

    // Update count
    const activeCount = this.todos.filter(t => !t.completed).length;
    this.todoCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'}`;

    // Show/hide clear completed button
    const hasCompleted = this.todos.some(t => t.completed);
    if (hasCompleted) {
      this.clearCompletedContainer.classList.remove('hidden');
    } else {
      this.clearCompletedContainer.classList.add('hidden');
    }

    // Render todos
    this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');

    // Add event listeners to todo items
    filteredTodos.forEach(todo => {
      const checkbox = document.getElementById(`checkbox-${todo.id}`) as HTMLInputElement;
      const deleteBtn = document.getElementById(`delete-${todo.id}`) as HTMLButtonElement;

      if (checkbox) {
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
      }
    });
  }

  private createTodoElement(todo: Todo): string {
    return `
      <li class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          id="checkbox-${todo.id}"
          ${todo.completed ? 'checked' : ''}
          class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span class="${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'} flex-1">
          ${this.escapeHtml(todo.text)}
        </span>
        <button
          id="delete-${todo.id}"
          class="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
          title="Delete task"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </li>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private saveTodos(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
  }

  private loadTodos(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.todos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
      } catch (e) {
        console.error('Failed to load todos from localStorage', e);
        this.todos = [];
      }
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
