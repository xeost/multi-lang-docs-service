import { Context } from 'hono';
import { UserRepositoryImpl } from '@infrastructure/database/d1/user.repository.impl';
// import { CreateUser } from '@aplication/usecases/user/create-user';
// import { GetUser } from '@aplication/usecases/user/get-user';
// import { UpdateUser } from '@aplication/usecases/user/update-user';
// import { DeleteUser } from '@aplication/usecases/user/delete-user';
// import { ListUsers } from '@aplication/usecases/user/list-users';
// import { GenerateUserToken } from '@aplication/usecases/user/generate-user-token';
import { GenerateTokenSchema, generateTokenSchema } from '@presentation/schemas/user.schema';
import { z } from 'zod';

// type ValidatedContext<T> = Context<{
//   Bindings: { DB: D1Database };
//   ValidatedData: { json: T };
// }>;

// Infer the TypeScript type from the Zod schema
// type GenerateToken = z.infer<typeof generateTokenSchema>;

// Define a type for the Hono context with validated data
// interface GenerateTokenContext extends Context {
//   req: Context['req'] & { valid: (key: 'json') => GenerateToken };
// }

// Define the environment bindings (same as in index.ts)
interface Bindings {
  DB: D1Database;
}

// Infer the type from the schema defined in routes (you could also move this to a shared file)
// const tokenSchema = z.object({
//   username: z.string().min(1),
// });
// type TokenInput = z.infer<typeof generateTokenSchema>;

// Extend Context type to include validated data and Cloudflare bindings
interface GenerateTokenContext extends Context<{ Bindings: Bindings }> {
  req: Context['req'] & { valid: (key: 'json') => GenerateTokenSchema };
}

interface Context2 extends Context<{
  Bindings: Bindings;
}, "/users/token", {
  in: {
    json: {
      username: string;
    };
  };
  out: {
    json: {
      username: string;
    };
  };
}> {
}

// Create a generic validator context type
type ValidatedContext<
  TSchema extends z.ZodType, // Schema type
  TBindings extends object = Bindings,      // Bindings type
  Path extends string = string // Path type (optional)
> = Context<{ Bindings: TBindings; }, Path, {
  in: { json: z.infer<TSchema> };
  out: { json: any };  // You could make this generic too if needed
}>;

export class UserController {
  static async create(c: Context) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const createUser = new CreateUser(userRepo);
    // const { username } = c.req.valid('json');
    // try {
    //   const user = await createUser.execute(username);
    //   return c.json(user, 201);
    // } catch (e) {
    //   return c.json({ error: (e as Error).message }, 409);
    // }
  }

  static async get(c: Context) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const getUser = new GetUser(userRepo);
    // const id = c.req.param('id');
    // const user = await getUser.execute(id);
    // if (!user) return c.json({ error: 'User not found' }, 404);
    // return c.json({ id: user.id, username: user.username }); // Exclude token
  }

  static async update(c: Context) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const updateUser = new UpdateUser(userRepo);
    // const id = c.req.param('id');
    // const { username } = c.req.valid('json');
    // try {
    //   const updatedUser = await updateUser.execute(id, username);
    //   return c.json({ id: updatedUser.id, username: updatedUser.username });
    // } catch (e) {
    //   return c.json({ error: (e as Error).message }, (e as Error).message.includes('not found') ? 404 : 409);
    // }
  }

  static async delete(c: Context) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const deleteUser = new DeleteUser(userRepo);
    // const id = c.req.param('id');
    // try {
    //   await deleteUser.execute(id);
    //   return c.json({ message: 'User deleted' });
    // } catch (e) {
    //   return c.json({ error: 'User not found' }, 404);
    // }
  }

  static async list(c: Context) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const listUsers = new ListUsers(userRepo);
    // const users = await listUsers.execute();
    // return c.json(users.map(u => ({ id: u.id, username: u.username }))); // Exclude tokens
  }

  async generateToken(c: ValidatedContext<typeof generateTokenSchema>) {
    // const db = c.env.DB;
    // const userRepo = new UserRepositoryImpl(db);
    // const generateToken = new GenerateUserToken(userRepo);
    const { username } = c.req.valid('json');

    const generateToken = { id: '1235', username, token: 'asdfsaf' }

    try {
      const result = generateToken; //await generateToken.execute(username);
      return c.json(result);
    } catch (e) {
      return c.json({ error: (e as Error).message }, 404);
    }
  }
}