import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/common/const';
import * as schema from 'src/db/schema';

@Injectable()
export class UserService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getById(
    id: number,
  ): Promise<
    Omit<
      schema.User,
      'passwordResetExpires' | 'passwordResetToken' | 'password'
    >
  > | null {
    const user = await this.db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        avatar: schema.user.avatar,
        role: schema.user.role,
      })
      .from(schema.user)
      .where(eq(schema.user.id, id));

    if (!user[0]) return null;

    return user[0];
  }

  async getByEmail(
    email: string,
    withPassword: boolean = false,
  ): Promise<
    Omit<schema.User, 'passwordResetExpires' | 'passwordResetToken'>
  > | null {
    const user = await this.db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        avatar: schema.user.avatar,
        role: schema.user.role,
        ...(withPassword && { password: schema.user.password }),
      })
      .from(schema.user)
      .where(eq(schema.user.email, email));

    if (!user[0]) return null;

    return user[0];
  }

  async create(email: string, hashedPassword: string): Promise<schema.NewUser> {
    const user = await this.db.insert(schema.user).values({
      email,
      password: hashedPassword,
    });

    return user[0];
  }
}
