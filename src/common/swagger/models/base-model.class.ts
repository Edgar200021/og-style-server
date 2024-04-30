import { ApiProperty } from '@nestjs/swagger';

export class BaseModel<T> {
  @ApiProperty({ enum: ['success'] })
  status: 'success';

  @ApiProperty({ type: Object })
  data: T;
}
