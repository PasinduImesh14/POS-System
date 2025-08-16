import React, { useEffect, useState, useRef } from 'react';
import { productsApi } from '../../utils/api';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  barcode: string;
  stock_quantity: number;
  category_name?: string;
}

const InventoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  // Load products only once
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await productsApi.getAll();
    setProducts(data);
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setNewStock(product.stock_quantity);
  };

  const handleSave = async (id: number) => {
    setLoading(true);
    await productsApi.update(id, { stock_quantity: newStock });
    setEditingId(null);
    await loadProducts();
    setLoading(false);
  };

  // Close modal on overlay click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) onClose();
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[80vh] flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-left">Barcode</th>
                  <th className="py-2 text-left">Category</th>
                  <th className="py-2 text-left">Stock</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td>{p.name}</td>
                    <td>{p.barcode}</td>
                    <td>{p.category_name}</td>
                    <td>
                      {editingId === p.id ? (
                        <input
                          type="number"
                          min={0}
                          value={newStock}
                          onChange={e => setNewStock(Number(e.target.value))}
                          className="border px-2 py-1 rounded w-16"
                        />
                      ) : (
                        p.stock_quantity
                      )}
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <>
                          <button
                            className="btn-success mr-2"
                            onClick={() => handleSave(p.id)}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-primary"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
