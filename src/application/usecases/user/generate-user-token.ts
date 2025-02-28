import { User } from '@domain/entities/user';
import { UserRepository } from '@application/interfaces/user-repository';
import { v4 as uuidv4 } from 'uuid';

export class GenerateUserToken {
  constructor(private userRepo: UserRepository) { }

  async execute(username: string): Promise<{ id: string; username: string; token: string }> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new Error('User not found');
    }
    const newToken = uuidv4();
    await this.userRepo.update(user.id, undefined, newToken);
    return { id: user.id, username: user.username, token: newToken };
  }
}