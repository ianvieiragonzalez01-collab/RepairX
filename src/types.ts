export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface Repair {
  id: string;
  customerId: string;
  deviceModel: string;
  reportedDefect: string;
  diagnosis?: string;
  checklist: {
    powersOn: boolean;
    charges: boolean;
    simRecognized: boolean;
    screenIntact: boolean;
    touchWorks: boolean;
  };
  status: 'pending' | 'in-progress' | 'waiting-parts' | 'finished' | 'delivered';
  imei?: string;
  estimatedTime?: string; // e.g., "2h", "1d"
  budget: {
    partsCost: number;
    laborCost: number;
    total: number;
  };
  entryDate: string;
  deliveryDate?: string;
  photos: string[]; // base64 or URLs
  notes: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  repairId?: string;
}
