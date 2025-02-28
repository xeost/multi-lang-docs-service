import { User } from '@domain/entities/user';
import { UserRepository } from '@application/interfaces/user-repository';
import { D1Database } from '@cloudflare/workers-types';

export class UserRepositoryImpl implements UserRepository {
  constructor(private db: D1Database) { }

  async findById(id: string): Promise<User | null> {
    const user = await this.db
      .prepare('SELECT * FROM Users WHERE id = ?')
      .bind(id)
      .first();
    if (!user) return null;
    return new User(user.id as string, user.username as string, user.token as string);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.db
      .prepare('SELECT * FROM Users WHERE username = ?')
      .bind(username)
      .first();
    if (!user) return null;
    return new User(user.id as string, user.username as string, user.token as string);
  }

  async findByToken(token: string): Promise<User | null> {
    const user = await this.db
      .prepare('SELECT * FROM Users WHERE token = ?')
      .bind(token)
      .first();
    if (!user) return null;
    return new User(user.id as string, user.username as string, user.token as string);
  }

  async create(user: User): Promise<void> {
    await this.db
      .prepare('INSERT INTO Users (id, username, token) VALUES (?, ?, ?)')
      .bind(user.id, user.username, user.token)
      .run();
  }

  async update(id: string, username?: string, token?: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('User not found');
    await this.db
      .prepare('UPDATE Users SET username = ?, token = ? WHERE id = ?')
      .bind(username || existing.username, token || existing.token, id)
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM Users WHERE id = ?')
      .bind(id)
      .run();
  }

  async list(): Promise<User[]> {
    const { results } = await this.db.prepare('SELECT * FROM Users').all();
    return results.map(
      (u: any) => new User(u.id as string, u.username as string, u.token as string)
    );
  }
}