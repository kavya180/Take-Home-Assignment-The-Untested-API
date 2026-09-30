const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => taskService._reset());

  test('creates and finds a task', () => {
    const task = taskService.create({ title: 'Test task', priority: 'high' });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test task');
    expect(task.priority).toBe('high');
    expect(task.status).toBe('todo');
    expect(task.completedAt).toBeNull();
    expect(taskService.findById(task.id)).toEqual(task);
  });

  test('returns a copy from getAll', () => {
    taskService.create({ title: 'A' });
    const tasks = taskService.getAll();
    tasks.pop();

    expect(taskService.getAll()).toHaveLength(1);
  });

  test('filters by exact status', () => {
    taskService.create({ title: 'Todo', status: 'todo' });
    taskService.create({ title: 'In progress', status: 'in_progress' });

    expect(taskService.getByStatus('todo').map((t) => t.title)).toEqual(['Todo']);
  });

  test('paginates from the first page using one-based page numbers', () => {
    ['A', 'B', 'C'].forEach((title) => taskService.create({ title }));

    expect(taskService.getPaginated(1, 2).map((t) => t.title)).toEqual(['A', 'B']);
    expect(taskService.getPaginated(2, 2).map((t) => t.title)).toEqual(['C']);
  });

  test('calculates status counts and overdue tasks', () => {
    taskService.create({ title: 'Todo', dueDate: '2000-01-01T00:00:00.000Z' });
    taskService.create({ title: 'Done', status: 'done', dueDate: '2000-01-01T00:00:00.000Z' });
    taskService.create({ title: 'Progress', status: 'in_progress' });

    expect(taskService.getStats()).toEqual({ todo: 1, in_progress: 1, done: 1, overdue: 1 });
  });

  test('updates and removes tasks', () => {
    const task = taskService.create({ title: 'Old' });
    expect(taskService.update(task.id, { title: 'New' }).title).toBe('New');
    expect(taskService.remove(task.id)).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
    expect(taskService.remove(task.id)).toBe(false);
  });

  test('completes a task without changing its priority', () => {
    const task = taskService.create({ title: 'Important', priority: 'high' });
    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.priority).toBe('high');
    expect(completed.completedAt).toEqual(expect.any(String));
  });

  test('assigns an unassigned task and rejects reassignment', () => {
    const task = taskService.create({ title: 'Assign me' });

    expect(taskService.assignTask(task.id, 'Alice').assignee).toBe('Alice');
    expect(taskService.assignTask(task.id, 'Bob')).toBe(false);
    expect(taskService.findById(task.id).assignee).toBe('Alice');
  });

  test('returns null when assigning a missing task', () => {
    expect(taskService.assignTask('missing-id', 'Alice')).toBeNull();
  });
});
