// Request.ts

export interface Request {
    requestId: string;
    serviceType: string;
    appointmentTime: Date;
    serviceFee: string;
    status: string;
    description: string;
    requestor: string;
    requestorImage: string;
    rating: number;
    publishedDate: Date;
  }
  