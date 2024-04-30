import { ApiProperty } from '@nestjs/swagger';
import * as schema from 'src/db/schema';

export class UserModel {
  @ApiProperty({ type: Number })
  id: schema.User['id'];

  @ApiProperty({ type: String })
  name: schema.User['name'];

  @ApiProperty({ type: String })
  email: schema.User['email'];

  @ApiProperty({ type: String })
  avatar: schema.User['email'];

  @ApiProperty({ enum: ['admin', 'user'], isArray: true })
  role: schema.User['role'];
}
