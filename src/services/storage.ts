import { Customer, Repair, Transaction } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'fixmaster_customers',
  REPAIRS: 'fixmaster_repairs',
  TRANSACTIONS: 'fixmaster_transactions',
};

export const StorageService = {
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomer: (customer: Customer) => {
    const customers = StorageService.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  getRepairs: (): Repair[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    return data ? JSON.parse(data) : [];
  },
  saveRepair: (repair: Repair) => {
    const repairs = StorageService.getRepairs();
    const index = repairs.findIndex(r => r.id === repair.id);
    if (index >= 0) {
      repairs[index] = repair;
    } else {
      repairs.push(repair);
    }
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = StorageService.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  deleteCustomer: (id: string) => {
    const customers = StorageService.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    // Also delete their repairs? Usually better to keep history, but user wants to "apagar para não ficar acumulado"
    // Let's just delete the customer for now as requested.
  },
  deleteRepair: (id: string) => {
    const repairs = StorageService.getRepairs().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  }
};
