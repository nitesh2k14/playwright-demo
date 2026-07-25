import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for TodoMVC React application
 * Encapsulates all page elements and actions for the TodoMVC React app
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly todoItems: Locator;
  readonly toggleAllCheckbox: Locator;
  readonly itemCount: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.locator('.new-todo');
    this.todoList = page.locator('.todo-list');
    this.todoItems = page.locator('.todo-list li');
    this.toggleAllCheckbox = page.locator('.toggle-all');
    this.itemCount = page.locator('.todo-count strong');
    this.filterAll = page.locator('.filters a:has-text("All")');
    this.filterActive = page.locator('.filters a:has-text("Active")');
    this.filterCompleted = page.locator('.filters a:has-text("Completed")');
    this.clearCompletedButton = page.locator('.clear-completed');
  }

  /**
   * Navigate to the TodoMVC application
   */
  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await expect(this.newTodoInput).toBeVisible({ timeout: 30000 });
  }

  /**
   * Add a new todo item
   * @param text - The todo text to add
   */
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Add multiple todo items
   * @param texts - Array of todo texts to add
   */
  async addTodos(texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  /**
   * Toggle a todo item by its text
   * @param text - The text of the todo to toggle
   */
  async toggleTodo(text: string): Promise<void> {
    const todoItem = this.todoItems.filter({ hasText: text });
    await todoItem.locator('.toggle').click();
  }

  /**
   * Toggle all todos using the toggle-all checkbox
   */
  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.click();
  }

  /**
   * Delete a todo item by its text
   * @param text - The text of the todo to delete
   */
  async deleteTodo(text: string): Promise<void> {
    const todoItem = this.todoItems.filter({ hasText: text });
    await todoItem.hover();
    await todoItem.locator('.destroy').click();
  }

  /**
   * Edit a todo item
   * @param oldText - The current text of the todo
   * @param newText - The new text to update to
   */
  async editTodo(oldText: string, newText: string): Promise<void> {
    const todoItem = this.todoItems.filter({ hasText: oldText });
    await todoItem.locator('label').dblclick();
    const editInput = todoItem.locator('.edit');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  /**
   * Filter todos by status
   * @param filter - 'all' | 'active' | 'completed'
   */
  async filterBy(filter: 'all' | 'active' | 'completed'): Promise<void> {
    switch (filter) {
      case 'all':
        await this.filterAll.click();
        break;
      case 'active':
        await this.filterActive.click();
        break;
      case 'completed':
        await this.filterCompleted.click();
        break;
    }
  }

  /**
   * Clear all completed todos
   */
  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  /**
   * Get the count of active (remaining) todos
   * @returns Number of active todos
   */
  async getActiveCount(): Promise<number> {
    const countText = await this.itemCount.textContent();
    return parseInt(countText || '0', 10);
  }

  /**
   * Get all todo texts
   * @returns Array of todo texts
   */
  async getAllTodoTexts(): Promise<string[]> {
    const texts = await this.todoItems.locator('label').allTextContents();
    return texts.map(t => t.trim());
  }

  /**
   * Get active todo texts
   * @returns Array of active todo texts
   */
  async getActiveTodoTexts(): Promise<string[]> {
    await this.filterBy('active');
    return this.getAllTodoTexts();
  }

  /**
   * Get completed todo texts
   * @returns Array of completed todo texts
   */
  async getCompletedTodoTexts(): Promise<string[]> {
    await this.filterBy('completed');
    return this.getAllTodoTexts();
  }

  /**
   * Check if a todo exists
   * @param text - The todo text to check
   * @returns True if todo exists
   */
  async hasTodo(text: string): Promise<boolean> {
    const todoItem = this.todoItems.filter({ hasText: text });
    return await todoItem.count() > 0;
  }

  /**
   * Check if a todo is completed
   * @param text - The todo text to check
   * @returns True if todo is completed
   */
  async isTodoCompleted(text: string): Promise<boolean> {
    const todoItem = this.todoItems.filter({ hasText: text });
    const checkbox = todoItem.locator('.toggle');
    return await checkbox.isChecked();
  }

  /**
   * Get the filter that is currently active
   * @returns The active filter text
   */
  async getActiveFilter(): Promise<string> {
    const activeFilter = this.page.locator('.filters a.selected');
    return (await activeFilter.textContent())?.trim() || '';
  }

  /**
   * Verify the active todo count matches expected
   * @param expectedCount - Expected number of active todos
   */
  async expectActiveCount(expectedCount: number): Promise<void> {
    await expect(this.itemCount).toHaveText(String(expectedCount));
  }

  /**
   * Verify a todo is visible
   * @param text - The todo text to verify
   * @param shouldExist - Whether the todo should exist (default: true)
   */
  async expectTodoVisible(text: string, shouldExist = true): Promise<void> {
    const todoItem = this.todoItems.filter({ hasText: text });
    if (shouldExist) {
      await expect(todoItem).toBeVisible();
    } else {
      await expect(todoItem).not.toBeVisible();
    }
  }

  /**
   * Verify a todo's completed state
   * @param text - The todo text to verify
   * @param completed - Expected completed state
   */
  async expectTodoCompleted(text: string, completed: boolean): Promise<void> {
    const todoItem = this.todoItems.filter({ hasText: text });
    await expect(todoItem.locator('.toggle')).toBeChecked({ checked: completed });
  }

  /**
   * Verify the active filter
   * @param expectedFilter - Expected active filter
   */
  async expectActiveFilter(expectedFilter: 'All' | 'Active' | 'Completed'): Promise<void> {
    const activeFilter = await this.getActiveFilter();
    expect(activeFilter).toBe(expectedFilter);
  }
}