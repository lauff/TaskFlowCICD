const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const app = express();

// Mock database setup
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool();
app.use(express.json());

// Mock endpoints
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

app.post('/tasks', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO tasks (name) VALUES ($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

// Tests
describe('Task API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all tasks', async () => {
    const mockTasks = [{ id: 1, name: 'Test Task' }];
    pool.query.mockResolvedValue({ rows: mockTasks });

    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTasks);
  });

  it('should create a new task', async () => {
    const mockTask = { id: 1, name: 'New Task' };
    pool.query.mockResolvedValue({ rows: [mockTask] });

    const res = await request(app).post('/tasks').send({ name: 'New Task' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTask);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO tasks (name) VALUES ($1) RETURNING *',
      [mockTask.name]
    );
  });
});
