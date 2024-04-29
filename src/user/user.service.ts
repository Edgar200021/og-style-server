import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';

@Injectable()
export class UserService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getById(
    id: number,
    withPassword = false,
  ): Promise<
    Omit<
      schema.User,
      'passwordResetExpires' | 'passwordResetToken' | 'googleId'
    >
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
      .where(eq(schema.user.id, id));

    if (!user[0]) return null;

    return user[0];
  }

  async getByEmail(
    email: string,
    withPassword: boolean = false,
  ): Promise<
    Omit<
      schema.User,
      'passwordResetExpires' | 'passwordResetToken' | 'googleId'
    >
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

  async getByTokenId(
    tokenId: string,
    key: 'googleId',
  ): Promise<
    Omit<schema.User, 'passwordResetExpires' | 'passwordResetToken'>
  > | null {
    const user = await this.db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user[key], tokenId)));
    return user[0] ?? null;
  }

  async getByPasswordResetExpires(email: string): Promise<schema.User> | null {
    const user = await this.db
      .select()
      .from(schema.user)
      .where(
        and(
          eq(schema.user.email, email),
          gt(schema.user.passwordResetExpires, new Date()),
        ),
      );

    return user[0] ?? null;
  }

  async create(email: string, hashedPassword: string): Promise<schema.NewUser> {
    const user = await this.db.insert(schema.user).values({
      email,
      password: hashedPassword,
    });

    return user[0];
  }

  async createFromOauth(
    email: string,
    token: string,
    key: 'googleId',
    avatar?: string,
    name?: string,
  ): Promise<
    Required<
      Omit<
        schema.NewUser,
        'passwordResetToken' | 'passwordResetExpires' | 'googleId'
      >
    >
  > {
    const user = await this.db
      .insert(schema.user)
      .values({
        email,
        [key]: token,
        ...(avatar && { avatar }),
        ...(name && { name }),
      })
      .returning({
        name: schema.user.name,
        avatar: schema.user.avatar,
        role: schema.user.role,
        email: schema.user.email,
        id: schema.user.id,
        password: schema.user.password,
      });

    return user[0];
  }

  async updatePasswordResetToken(
    userId: number,
    passwordResetToken: string | null,
    passwordResetExpires: Date | null,
  ) {
    await this.db
      .update(schema.user)
      .set({
        passwordResetToken,
        passwordResetExpires,
      })
      .where(eq(schema.user.id, userId));
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await this.db
      .update(schema.user)
      .set({
        password: hashedPassword,
      })
      .where(eq(schema.user.id, userId));
  }
}
