import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

/**
 * Test suite for TodoMVC React application
 * Tests cover:
 * 1. Adding a todo
 * 2. Completing a todo
 * 3. Editing a todo
 * 4. Filtering todos (All, Active, Completed)
 * 5. Deleting a todo
 * 6. Clearing completed todos
 */

test.describe('TodoMVC React - Core Functionality', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.describe('Add Todo', () => {
    test('should add a single todo item', async () => {
      const todoText = 'Learn Playwright';

      await todoPage.addTodo(todoText);
      await todoPage.expectTodoVisible(todoText);
      await todoPage.expectActiveCount(1);
    });

    test('should add multiple todo items', async () => {
      const todos = ['Buy groceries', 'Walk the dog', 'Write tests'];

      await todoPage.addTodos(todos);

      for (const todo of todos) {
        await todoPage.expectTodoVisible(todo);
      }
      await todoPage.expectActiveCount(3);
    });

    test('should not add empty todo', async () => {
      await todoPage.newTodoInput.press('Enter');
      await expect(todoPage.todoItems).toHaveCount(0);
    });

    test('should trim whitespace from todo text', async () => {
      await todoPage.addTodo('  Spaced todo  ');
      await todoPage.expectTodoVisible('Spaced todo');
      await todoPage.expectActiveCount(1);
    });
  });

  test.describe('Complete Todo', () => {
    test.beforeEach(async () => {
      await todoPage.addTodo('Complete me');
    });

    test('should mark todo as completed when checkbox is clicked', async () => {
      await todoPage.toggleTodo('Complete me');
      await todoPage.expectTodoCompleted('Complete me', true);
      await todoPage.expectActiveCount(0);
    });

    test('should show strikethrough for completed todo', async () => {
      await todoPage.toggleTodo('Complete me');
      const todoItem = todoPage.todoItems.filter({ hasText: 'Complete me' });
      await expect(todoItem).toHaveClass(/completed/);
    });

    test('should unmark todo when checkbox is clicked again', async () => {
      await todoPage.toggleTodo('Complete me');
      await todoPage.toggleTodo('Complete me');
      await todoPage.expectTodoCompleted('Complete me', false);
      await todoPage.expectActiveCount(1);
    });

    test('should toggle all todos using toggle-all checkbox', async () => {
      await todoPage.addTodos(['Todo 1', 'Todo 2', 'Todo 3']);

      await todoPage.toggleAll();

      for (const todo of ['Todo 1', 'Todo 2', 'Todo 3', 'Complete me']) {
        await todoPage.expectTodoCompleted(todo, true);
      }
      await todoPage.expectActiveCount(0);

      await todoPage.toggleAll();

      for (const todo of ['Todo 1', 'Todo 2', 'Todo 3', 'Complete me']) {
        await todoPage.expectTodoCompleted(todo, false);
      }
      await todoPage.expectActiveCount(4);
    });
  });

  test.describe('Edit Todo', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(['Todo to edit', 'Another todo']);
    });

    test('should edit todo text on double click and Enter', async () => {
      await todoPage.editTodo('Todo to edit', 'Edited todo text');
      await todoPage.expectTodoVisible('Edited todo text');
      await todoPage.expectTodoVisible('Todo to edit', false);
    });

    test('should trim entered text when editing', async () => {
      await todoPage.editTodo('Todo to edit', '   Trimmed edit   ');
      await todoPage.expectTodoVisible('Trimmed edit');
    });

    test('should remove todo if edited text is empty', async () => {
      await todoPage.editTodo('Todo to edit', '');
      await todoPage.expectTodoVisible('Todo to edit', false);
      await todoPage.expectActiveCount(1);
    });

    test('should cancel edit on Escape key press', async () => {
      const todoItem = todoPage.todoItems.filter({ hasText: 'Todo to edit' });
      await todoItem.locator('label').dblclick();
      const editInput = todoItem.locator('.edit');
      await editInput.fill('Changed text');
      await editInput.press('Escape');
      await todoPage.expectTodoVisible('Todo to edit');
      await todoPage.expectTodoVisible('Changed text', false);
    });
  });

  test.describe('Filter Todos', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(['Active todo 1', 'Active todo 2', 'Completed todo']);
      await todoPage.toggleTodo('Completed todo');
    });

    test('should show all todos when All filter is selected', async () => {
      await todoPage.filterBy('all');
      await todoPage.expectActiveFilter('All');

      await todoPage.expectTodoVisible('Active todo 1');
      await todoPage.expectTodoVisible('Active todo 2');
      await todoPage.expectTodoVisible('Completed todo');
    });

    test('should show only active todos when Active filter is selected', async () => {
      await todoPage.filterBy('active');
      await todoPage.expectActiveFilter('Active');

      await todoPage.expectTodoVisible('Active todo 1');
      await todoPage.expectTodoVisible('Active todo 2');
      await todoPage.expectTodoVisible('Completed todo', false);
    });

    test('should show only completed todos when Completed filter is selected', async () => {
      await todoPage.filterBy('completed');
      await todoPage.expectActiveFilter('Completed');

      await todoPage.expectTodoVisible('Active todo 1', false);
      await todoPage.expectTodoVisible('Active todo 2', false);
      await todoPage.expectTodoVisible('Completed todo');
    });

    test('should persist filter selection after adding new todo', async () => {
      await todoPage.filterBy('active');
      await todoPage.addTodo('New active todo');

      await todoPage.expectTodoVisible('New active todo');
      await todoPage.expectActiveFilter('Active');
    });
  });

  test.describe('Delete Todo', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(['Todo to delete', 'Todo to keep']);
    });

    test('should delete todo when destroy button is clicked', async () => {
      await todoPage.deleteTodo('Todo to delete');
      await todoPage.expectTodoVisible('Todo to delete', false);
      await todoPage.expectTodoVisible('Todo to keep');
      await todoPage.expectActiveCount(1);
    });

    test('should show destroy button on hover', async () => {
      const todoItem = todoPage.todoItems.filter({ hasText: 'Todo to delete' });
      const destroyButton = todoItem.locator('.destroy');

      await expect(destroyButton).not.toBeVisible();
      await todoItem.hover();
      await expect(destroyButton).toBeVisible();
    });
  });

  test.describe('Clear Completed', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(['Active todo', 'Completed todo 1', 'Completed todo 2']);
      await todoPage.toggleTodo('Completed todo 1');
      await todoPage.toggleTodo('Completed todo 2');
    });

    test('should remove all completed todos', async () => {
      await todoPage.clearCompleted();

      await todoPage.expectTodoVisible('Completed todo 1', false);
      await todoPage.expectTodoVisible('Completed todo 2', false);
      await todoPage.expectTodoVisible('Active todo');
      await todoPage.expectActiveCount(1);
    });

    test('should not affect active todos', async () => {
      await todoPage.clearCompleted();
      await todoPage.filterBy('active');

      const activeTodos = await todoPage.getActiveTodoTexts();
      expect(activeTodos).toEqual(['Active todo']);
    });

    test('should hide clear completed button when no completed todos', async () => {
      await todoPage.clearCompleted();
      await expect(todoPage.clearCompletedButton).not.toBeVisible();
    });
  });

  test.describe('Combined Scenarios', () => {
    test('should handle complex workflow: add, complete, filter, delete, clear', async () => {
      // Add multiple todos
      await todoPage.addTodos(['Task 1', 'Task 2', 'Task 3', 'Task 4']);
      await todoPage.expectActiveCount(4);

      // Complete some todos
      await todoPage.toggleTodo('Task 1');
      await todoPage.toggleTodo('Task 3');
      await todoPage.expectActiveCount(2);

      // Filter active
      await todoPage.filterBy('active');
      await todoPage.expectTodoVisible('Task 1', false);
      await todoPage.expectTodoVisible('Task 2');
      await todoPage.expectTodoVisible('Task 3', false);
      await todoPage.expectTodoVisible('Task 4');

      // Filter completed
      await todoPage.filterBy('completed');
      await todoPage.expectTodoVisible('Task 1');
      await todoPage.expectTodoVisible('Task 2', false);
      await todoPage.expectTodoVisible('Task 3');
      await todoPage.expectTodoVisible('Task 4', false);

      // Delete a completed todo
      await todoPage.deleteTodo('Task 1');
      await todoPage.expectTodoVisible('Task 1', false);
      await todoPage.expectActiveCount(2);

      // Clear completed
      await todoPage.filterBy('all');
      await todoPage.clearCompleted();
      await todoPage.expectTodoVisible('Task 3', false);
      await todoPage.expectActiveCount(2);
      await todoPage.expectTodoVisible('Task 2');
      await todoPage.expectTodoVisible('Task 4');
    });

    test('should persist data across filter changes', async () => {
      await todoPage.addTodo('Persistent todo');
      await todoPage.toggleTodo('Persistent todo');

      await todoPage.filterBy('active');
      await todoPage.filterBy('completed');
      await todoPage.filterBy('all');

      await todoPage.expectTodoVisible('Persistent todo');
      await todoPage.expectTodoCompleted('Persistent todo', true);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle special characters in todo text', async () => {
      const specialText = 'Test @#$%^&*()_+{}|:"<>?~`';
      await todoPage.addTodo(specialText);
      await todoPage.expectTodoVisible(specialText);
    });

    test('should handle very long todo text', async () => {
      const longText = 'A'.repeat(500);
      await todoPage.addTodo(longText);
      await todoPage.expectTodoVisible(longText);
    });

    test('should handle unicode characters', async () => {
      const unicodeText = '🎉 Todo with emojis 🎊 中文 español français';
      await todoPage.addTodo(unicodeText);
      await todoPage.expectTodoVisible(unicodeText);
    });
  });
});