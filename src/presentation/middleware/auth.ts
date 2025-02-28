// import { Context, Next } from 'hono';
// import { UserRepositoryImpl } from '@infrastructure/database/d1/user-repository.impl';

// export async function authMiddleware(c: Context<{ Bindings: { DB: D1Database } }>, next: Next) {
//   const publicEndpoints = ['/users', '/users/token'];
//   if (publicEndpoints.includes(c.req.path) && c.req.method === 'POST') {
//     return next();
//   }
//   const authHeader = c.req.header('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return c.json({ error: 'Unauthorized: Bearer Token required' }, 401);
//   }
//   const token = authHeader.split(' ')[1];
//   const userRepo = new UserRepositoryImpl(c.env.DB);
//   const user = await userRepo.findByToken(token);
//   if (!user) return c.json({ error: 'Invalid token' }, 401);
//   await next();
// }