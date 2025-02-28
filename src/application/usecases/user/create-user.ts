import { User } from '@domain/entities/user';
import { UserRepository } from '@application/interfaces/user-repository';
import { v4 as uuidv4 } from 'uuid';

export class CreateUser {
  constructor(private userRepo: UserRepository) { }

  async execute(username: string): Promise<User> {
    const existingUser = await this.userRepo.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    const id = uuidv4();
    const token = uuidv4();
    const user = new User(id, username, token);
    await this.userRepo.create(user);
    return user;
  }
}