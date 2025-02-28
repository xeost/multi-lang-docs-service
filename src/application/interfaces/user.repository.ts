import { User } from '@domain/entities/user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByToken(token: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(id: string, username?: string, token?: string): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<User[]>;
}