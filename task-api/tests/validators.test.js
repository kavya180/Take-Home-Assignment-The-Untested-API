const { validateCreateTask, validateUpdateTask, validateAssignee } = require('../src/utils/validators');

describe('validators', () => {
  test('validates create task fields', () => {
    expect(validateCreateTask({ title: 'Task' })).toBeNull();
    expect(validateCreateTask({ title: ' ' })).toMatch(/title is required/);
    expect(validateCreateTask({ title: 'Task', status: 'invalid' })).toMatch(/status must be one of/);
    expect(validateCreateTask({ title: 'Task', priority: 'urgent' })).toMatch(/priority must be one of/);
    expect(validateCreateTask({ title: 'Task', dueDate: 'not-a-date' })).toMatch(/dueDate must be a valid ISO date string/);
  });

  test('validates update task fields when present', () => {
    expect(validateUpdateTask({})).toBeNull();
    expect(validateUpdateTask({ title: '' })).toMatch(/title must be a non-empty string/);
    expect(validateUpdateTask({ status: 'invalid' })).toMatch(/status must be one of/);
    expect(validateUpdateTask({ priority: 'urgent' })).toMatch(/priority must be one of/);
    expect(validateUpdateTask({ dueDate: 'not-a-date' })).toMatch(/dueDate must be a valid ISO date string/);
  });

  test('requires a non-empty string assignee', () => {
    expect(validateAssignee('Alice')).toBeNull();
    expect(validateAssignee('')).toMatch(/assignee must be/);
    expect(validateAssignee('   ')).toMatch(/assignee must be/);
    expect(validateAssignee(123)).toMatch(/assignee must be/);
  });
});
