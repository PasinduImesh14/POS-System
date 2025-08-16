import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Clock } from 'lucide-react';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import InventoryModal from './InventoryModal';

const POSInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const [showInventory, setShowInventory] = useState(false);
  
  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">RealTimePOS</h1>
            <div className="text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Employee: {user?.name}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {getCurrentTime()}
                </div>
                <div>
                  {getCurrentDate()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-gray-500 capitalize">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            {user?.role === 'admin' && (
              <button
                className="btn-secondary"
                onClick={() => setShowInventory(true)}
              >
                Inventory
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
            <ProductGrid />
          </div>
        </div>

        {/* Cart/Sidebar Section */}
        <div className="w-80 bg-white border-l p-6">
          <Cart />
        </div>
      </div>

      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
    </div>
  );
};

export default POSInterface;