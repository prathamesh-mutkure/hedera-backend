import { Organization } from '@prisma/client';

export type AuthOrganization = Organization & {
  type: 'ORGANIZATION';
};
