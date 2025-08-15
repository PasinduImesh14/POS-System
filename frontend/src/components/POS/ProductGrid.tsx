import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { productsApi, categoriesApi } from '../../utils/api';
import { useCart } from '../../contexts/CartContext';
import { Search, Package } from 'lucide-react';

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll(),
        categoriesApi.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const productsData = await productsApi.getAll(params);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.stock_quantity > 0) {
      addItem(product);
    }
  };

  const getProductCardStyle = (product: Product) => {
    const baseStyle = 'product-card';
    const categoryColor = product.category_color || '#3B82F6';
    
    return {
      borderColor: categoryColor,
      backgroundColor: product.stock_quantity > 0 ? '#ffffff' : '#f9f9f9',
      opacity: product.stock_quantity > 0 ? 1 : 0.6,
      cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed'
    };
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`category-card ${selectedCategory === null ? 'active' : ''}`}
            style={{ borderColor: selectedCategory === null ? '#3B82F6' : '#e5e7eb' }}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              style={{ 
                borderColor: selectedCategory === category.id ? category.color : '#e5e7eb',
                backgroundColor: selectedCategory === category.id ? `${category.color}10` : '#ffffff'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Package className="w-12 h-12 mb-2" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="pos-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="product-card"
                style={getProductCardStyle(product)}
                onClick={() => handleProductClick(product)}
              >
                <div className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                  {product.name}
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${formatPrice(product.price)}
                </div>
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <div className="text-xs text-orange-500 mt-1">
                    Low stock: {product.stock_quantity}
                  </div>
                )}
                {product.stock_quantity === 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    Out of stock
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;