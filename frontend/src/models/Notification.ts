// src/types.ts

export interface Notification {
  _id: string;
  content: string;
  isViewed: boolean;
  createdAt: string;
  review?: string;
  updatedAt: string;
  recipient: string;
  serviceRequest?:string;
  job?: string;
  notificationType: string;
}
