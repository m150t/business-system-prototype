export interface TripRequest {
  id: string;
  employeeName: string;
  department: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  selectedRoute?: RouteInfo;
}

export interface Expense {
  id: string;
  tripRequestId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipt?: string;
}

export interface RouteInfo {
  id: string;
  departure: string;
  arrival: string;
  duration: number;
  fare: number;
  transfers: number;
  steps: RouteStep[];
  isCheapest?: boolean;
  cheapestFare?: number;
}

export interface RouteStep {
  type: 'train' | 'walk';
  line?: string;
  from: string;
  to: string;
  duration: number;
  fare?: number;
}