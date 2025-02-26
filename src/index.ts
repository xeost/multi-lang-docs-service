import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM documents').all();
  return c.json(result);
});

export default app;