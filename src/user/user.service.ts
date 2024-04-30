import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';
import { UpdateUserDto } from './dto/update-user.dto';

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
      'passwordResetExpires' | 'passwordResetToken' | 'googleId' | 'githubId'
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
      'passwordResetExpires' | 'passwordResetToken' | 'googleId' | 'githubId'
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

  async getByOauthId(
    tokenId: string | number,
    key: 'googleId' | 'githubId',
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
    oauthId: string | number,
    key: 'googleId' | 'githubId',
    avatar?: string,
    name?: string,
  ): Promise<
    Required<
      Omit<
        schema.NewUser,
        'passwordResetToken' | 'passwordResetExpires' | 'googleId' | 'githubId'
      >
    >
  > {
    const user = await this.db
      .insert(schema.user)
      .values({
        email,
        [key]: oauthId,
        ...(avatar && { avatar }),
        ...(name && { name }),
      })
      .onConflictDoUpdate({
        target: schema.user.email,
        set: { [key]: oauthId },
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

  async updateUser(userId: number, { email, avatar, name }: UpdateUserDto) {
    await this.db
      .update(schema.user)
      .set({
        ...(email && { email }),
        ...(name && { name }),
        ...(avatar && { avatar }),
      })
      .where(eq(schema.user.id, userId));
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
