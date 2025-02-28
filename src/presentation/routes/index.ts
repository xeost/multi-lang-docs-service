import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserController } from '@presentation/controllers/user.controller';
// import { authMiddleware } from '@presentation/middleware/auth';
import { generateTokenSchema } from '@presentation/schemas/user.schema';

interface Bindings {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Instantiate controllers
const userController = new UserController();

// Apply authentication middleware
// app.use('*', authMiddleware);

// User Routes
app.post('/users',
  zValidator('json', z.object({ username: z.string().min(1) })),
  UserController.create
);
app.get('/users/:id', UserController.get);
app.put('/users/:id',
  zValidator('json', z.object({ username: z.string().min(1) })),
  UserController.update
);
app.delete('/users/:id', UserController.delete);

app.get('/users', UserController.list);

app.post('/users/token',
  zValidator('json', generateTokenSchema),
  userController.generateToken.bind(userController)
);

// Add similar route definitions for websites, translations, articles, affiliate programs, and stats
// Example for websites (abbreviated):
// app.post(
//   '/websites', 
//   zValidator('json', z.object({ url: z.string().url(), name: z.string().min(1), check_interval: z.string().optional() })), 
//   WebsiteController.create
// );
// ... continue for other routes

export default app;