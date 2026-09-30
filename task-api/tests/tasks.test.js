const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

const createTask = async (overrides = {}) => {
  const response = await request(app)
    .post('/tasks')
    .send({ title: 'Test task', priority: 'high', ...overrides });
  return response.body;
};

describe('Task API', () => {
  beforeEach(() => taskService._reset());

  test('GET /tasks lists tasks', async () => {
    await createTask({ title: 'A' });
    await createTask({ title: 'B' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test('GET /tasks?status filters tasks', async () => {
    await createTask({ title: 'Todo', status: 'todo' });
    await createTask({ title: 'Done', status: 'done' });

    const response = await request(app).get('/tasks?status=done');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Done');
  });

  test('GET /tasks?page=1&limit=2 paginates', async () => {
    await createTask({ title: 'A' });
    await createTask({ title: 'B' });
    await createTask({ title: 'C' });

    const response = await request(app).get('/tasks?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.map((task) => task.title)).toEqual(['A', 'B']);
  });

  test('POST /tasks creates a task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'New task', priority: 'high' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New task');
    expect(response.body.priority).toBe('high');
    expect(response.body.id).toBeDefined();
  });

  test('POST /tasks rejects a missing title', async () => {
    const response = await request(app).post('/tasks').send({ priority: 'high' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/title is required/);
  });

  test('PUT /tasks/:id updates a task', async () => {
    const task = await createTask({ title: 'Old title' });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({ title: 'Updated title' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated title');
    expect(response.body.priority).toBe('high');
  });

  test('PUT /tasks/:id returns 404 for a missing task', async () => {
    const response = await request(app)
      .put('/tasks/missing-id')
      .send({ title: 'Updated' });

    expect(response.status).toBe(404);
  });

  test('DELETE /tasks/:id deletes a task', async () => {
    const task = await createTask();

    const response = await request(app).delete(`/tasks/${task.id}`);

    expect(response.status).toBe(204);
    expect((await request(app).get('/tasks')).body).toHaveLength(0);
  });

  test('DELETE /tasks/:id returns 404 for a missing task', async () => {
    const response = await request(app).delete('/tasks/missing-id');

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/complete marks a task done', async () => {
    const task = await createTask({ priority: 'high' });

    const response = await request(app).patch(`/tasks/${task.id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.priority).toBe('high');
    expect(response.body.completedAt).toEqual(expect.any(String));
  });

  test('PATCH /tasks/:id/complete returns 404 for a missing task', async () => {
    const response = await request(app).patch('/tasks/missing-id/complete');

    expect(response.status).toBe(404);
  });

  test('GET /tasks/stats returns counts and overdue count', async () => {
    await createTask({ title: 'Overdue', dueDate: '2000-01-01T00:00:00.000Z' });
    await createTask({ title: 'Done', status: 'done', dueDate: '2000-01-01T00:00:00.000Z' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ todo: 1, in_progress: 0, done: 1, overdue: 1 });
  });

  test('PATCH /tasks/:id/assign assigns a task', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Alice' });

    expect(response.status).toBe(200);
    expect(response.body.assignee).toBe('Alice');
  });

  test('PATCH /tasks/:id/assign rejects an empty assignee', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '   ' });

    expect(response.status).toBe(400);
  });

  test('PATCH /tasks/:id/assign returns 404 for a missing task', async () => {
    const response = await request(app)
      .patch('/tasks/missing-id/assign')
      .send({ assignee: 'Alice' });

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/assign rejects reassignment', async () => {
    const task = await createTask();
    await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Alice' });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Bob' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Task is already assigned');
  });
});
