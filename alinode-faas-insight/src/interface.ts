/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

export enum ProjectType {
  application = 0,
  function = 1,
}

export interface ReadableProject {
  id: string;
  type: keyof typeof ProjectType;
  name: string;
  scope: string;
  scopeExternalId: string;
  scopeExternalName: string;
  scopeNamespace: string;
  createdAt: Date;
  updatedAt: Date;
}
