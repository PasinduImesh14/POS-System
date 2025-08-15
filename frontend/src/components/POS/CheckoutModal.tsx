import React from 'react';
import { CartItem } from '../../types';
import { X, CreditCard, DollarSign, Smartphone } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (paymentMethod: 'cash' | 'card' | 'digital') => void;
  isProcessing: boolean;
  total: number;
  subtotal: number;
  tax: number;
  items: CartItem[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onCheckout,
  isProcessing,
  total,
  subtotal,
  tax,
  items
}) => {
  const formatPrice = (price: number) => price.toFixed(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 max-h-48 overflow-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="flex-1">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="font-medium">${formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>${formatPrice(tax)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">${formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-semibold">Choose Payment Method</h3>
          
          <button
            onClick={() => onCheckout('cash')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex items-center"
            disabled={isProcessing}
          >
            <DollarSign className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium">Cash</div>
              <div className="text-sm text-gray-500">Pay with cash</div>
            </div>
          </button>

          <button
            onClick={() => onCheckout('card')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
            disabled={isProcessing}
          >
            <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium">Credit/Debit Card</div>
              <div className="text-sm text-gray-500">Pay with card</div>
            </div>
          </button>

          <button
            onClick={() => onCheckout('digital')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center"
            disabled={isProcessing}
          >
            <Smartphone className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-medium">Digital Payment</div>
              <div className="text-sm text-gray-500">Mobile wallet, QR code</div>
            </div>
          </button>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing payment...
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full btn-secondary"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;