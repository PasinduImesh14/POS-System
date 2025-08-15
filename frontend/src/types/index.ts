export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Product {
  id: number;
  barcode: string;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category_name?: string;
  category_color?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  barcode: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  employee_id: number;
  employee_name: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'digital';
  created_at: string;
  items?: TransactionItem[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getItemCount: () => number;
}

export interface ApiError {
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}