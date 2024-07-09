import { IsString, IsUrl } from 'class-validator';

export class UpdateOrgProfileDTO {
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

  /**
   * Official website of company
   */
  @IsUrl({}, { message: 'Official website of company' })
  website?: string;
}
