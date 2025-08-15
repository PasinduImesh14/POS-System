import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { transactionsApi } from '../../utils/api';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, DollarSign, Smartphone } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal, getItemCount } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const item = items.find(item => item.product.id === productId);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const handleCheckout = async (paymentMethod: 'cash' | 'card' | 'digital') => {
    setIsProcessing(true);
    try {
      const transactionData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal(),
        payment_method: paymentMethod
      };

      await transactionsApi.create(transactionData);
      clearCart();
      setIsCheckoutOpen(false);
      
      // Show success message or redirect
      alert('Transaction completed successfully!');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <ShoppingCart className="w-16 h-16 mb-4" />
        <p className="text-lg">Cart is empty</p>
        <p className="text-sm">Add items to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart ({getItemCount()})
        </h2>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 p-1"
          title="Clear cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.product.id} className="cart-item">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-900 leading-tight">
                  {item.product.name}
                </h3>
                <p className="text-xs text-gray-500">
                  ${formatPrice(item.product.price)} each
                </p>
              </div>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.product.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  disabled={item.quantity >= item.product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  ${formatPrice(item.total)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Totals */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span>${formatPrice(getSubtotal())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${formatPrice(getTax())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Discounts</span>
          <span>$0.00</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between text-xl font-bold text-green-600">
            <span>Total</span>
            <span>${formatPrice(getTotal())}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-4 space-y-2">
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full btn-success flex items-center justify-center"
          disabled={isProcessing}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Checkout'}
        </button>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleCheckout('cash')}
            className="btn-secondary flex flex-col items-center py-3"
            disabled={isProcessing}
          >
            <DollarSign className="w-5 h-5 mb-1" />
            <span className="text-xs">Cash</span>
          </button>
          <button
            onClick={() => handleCheckout('card')}
            className="btn-secondary flex flex-col items-center py-3"
            disabled={isProcessing}
          >
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-xs">Card</span>
          </button>
          <button
            onClick={() => handleCheckout('digital')}
            className="btn-secondary flex flex-col items-center py-3"
            disabled={isProcessing}
          >
            <Smartphone className="w-5 h-5 mb-1" />
            <span className="text-xs">Digital</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
        total={getTotal()}
        subtotal={getSubtotal()}
        tax={getTax()}
        items={items}
      />
    </div>
  );
};

export default Cart;