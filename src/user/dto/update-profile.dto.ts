import { IsString, IsUrl } from 'class-validator';

export class UpdateUserProfileDTO {
  /**
   * URL of image
   */
  @IsUrl({}, { message: 'URL of image' })
  avatar?: string;

  /**
   * Full name of Organization
   */
  @IsString({ message: 'Full name of Organization' })
  name?: string;
}
