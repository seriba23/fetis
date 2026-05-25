import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  ids!: string[];
}
