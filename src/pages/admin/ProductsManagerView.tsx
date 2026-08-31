import React, { useState } from 'react';
import { Product } from '../../types';
import { formatInr } from '../../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface ProductsManagerViewProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onDuplicateProduct: (product: Product) => Promise<void>;
  onQuickUpdateStock: (productId: string, variantId: string, newStock: number) => Promise<void>;
}

export const ProductsManagerView: React.FC<ProductsManagerViewProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onDuplicateProduct,
  onQuickUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isDuplicatingId, setIsDuplicatingId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Quick stock editor state
  const [stockEditingVariantId, setStockEditingVariantId] = useState<string | null>(null);
  const [stockEditingValue, setStockEditingValue] = useState<number>(0);
  const [stockEditingProductId, setStockEditingProductId] = useState<string | null>(null);
  const [stockErrorMsg, setStockErrorMsg] = useState<string | null>(null);
  const [isSavingStock, setIsSavingStock] = useState(false);

  // Filter products
  const filteredProducts = products.filter(prod => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.collectionName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const totalStock = prod.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    const matchesStock =
      selectedStockFilter === 'all' ||
      (selectedStockFilter === 'in_stock' && totalStock > 0) ||
      (selectedStockFilter === 'low_stock' && totalStock > 0 && totalStock <= 5) ||
      (selectedStockFilter === 'out_of_stock' && totalStock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleDelete = async (productId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently remove "${title}" from the catalog?`)) {
      setIsDeletingId(productId);
      setOperationError(null);
      try {
        await onDeleteProduct(productId);
      } catch (err: any) {
        setOperationError(err.message || 'Failed to delete product from database.');
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const handleDuplicate = async (product: Product) => {
    setIsDuplicatingId(product.id);
    setOperationError(null);
    try {
      await onDuplicateProduct(product);
    } catch (err: any) {
      setOperationError(err.message || 'Failed to duplicate product in database.');
    } finally {
      setIsDuplicatingId(null);
    }
  };

  const handleStartStockEdit = (productId: string, variantId: string, currentStock: number) => {
    setStockEditingProductId(productId);
    setStockEditingVariantId(variantId);
    setStockEditingValue(currentStock);
    setStockErrorMsg(null);
  };

  const handleSaveStock = async () => {
    if (!stockEditingProductId || !stockEditingVariantId) return;
    setIsSavingStock(true);
    setStockErrorMsg(null);
    try {
      await onQuickUpdateStock(stockEditingProductId, stockEditingVariantId, stockEditingValue);
      setStockEditingVariantId(null);
      setStockEditingProductId(null);
    } catch (err: any) {
      setStockErrorMsg(err.message || 'Failed to update stock quantity.');
    } finally {
      setIsSavingStock(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Atelier Catalog Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-text mt-1">
            Haute Couture & Ready-To-Wear Inventory
          </h1>
        </div>

        <button
          onClick={onAddProduct}
          className="px-5 py-2.5 bg-antique-gold text-primary font-semibold tracking-wider uppercase text-xs hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Surface Error Banner if operation failed */}
      {operationError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{operationError}</span>
          </div>
          <button
            onClick={() => setOperationError(null)}
            className="text-red-700 hover:text-red-900 font-semibold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 flex flex-col md:flex-row items-stretch md:items-center gap-3 text-xs font-sans">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-text/50 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, silhouette, collection..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bridal">Bridal Couture</option>
            <option value="lehengas">Occasion Lehengas</option>
            <option value="sarees">Artisanal Sarees</option>
            <option value="anarkalis">Contemporary Anarkalis</option>
            <option value="ready-to-wear">Ready To Wear</option>
            <option value="accessories">Accessories</option>
          </select>

          {/* Stock filter */}
          <select
            value={selectedStockFilter}
            onChange={e => setSelectedStockFilter(e.target.value)}
            className="p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-outline-variant/40 bg-surface-container-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-container text-charcoal-text/70 uppercase text-[10px] tracking-wider border-b border-outline-variant/40">
              <tr>
                <th className="p-4">Piece & Imagery</th>
                <th className="p-4">Category & Collection</th>
                <th className="p-4">Base Price (INR)</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4">Attributes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredProducts.map(product => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const isOutOfStock = totalStock === 0;
                const isLowStock = totalStock > 0 && totalStock <= 5;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-container/40 transition-colors"
                  >
                    {/* Image & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-18 bg-surface-container flex-shrink-0 overflow-hidden border border-outline-variant/50">
                          <img
                            src={product.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="font-serif text-sm text-charcoal-text font-medium block">
                            {product.title}
                          </span>
                          <span className="font-mono text-[10px] text-charcoal-text/50 block">
                            slug: {product.slug}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-charcoal-text/60">
                            <span>{product.variants.length} sizes configured</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Collection */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-antique-gold/15 text-primary border border-antique-gold/30 text-[10px] font-semibold uppercase tracking-wider inline-block">
                          {product.categoryLabel || product.category}
                        </span>
                        <span className="text-[11px] text-charcoal-text/70 block">
                          {product.collectionName || 'Mainline Capsule'}
                        </span>
                      </div>
                    </td>

                    {/* Base Price */}
                    <td className="p-4">
                      <span className="font-serif text-sm font-semibold text-antique-gold">
                        {formatInr(product.basePriceInr)}
                      </span>
                    </td>

                    {/* Stock & Quick Tuner */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isOutOfStock
                                ? 'bg-red-100 text-red-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low (${totalStock})` : `${totalStock} in stock`}
                          </span>
                        </div>

                        {/* Variants mini list */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.variants.map(v => (
                            <button
                              key={v.id}
                              onClick={() => handleStartStockEdit(product.id, v.id, v.stockQuantity)}
                              className="px-1.5 py-0.5 bg-background border border-outline-variant/60 hover:border-antique-gold text-[10px] font-mono flex items-center gap-1"
                              title="Click to quickly tune stock quantity"
                            >
                              <span>{v.size}:</span>
                              <strong className={v.stockQuantity === 0 ? 'text-red-600' : 'text-charcoal-text'}>
                                {v.stockQuantity}
                              </strong>
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Attributes */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-[10px] text-charcoal-text/70">
                        {product.isFeatured && (
                          <span className="text-antique-gold font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured on Home
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="text-emerald-700 font-medium">
                            • New Arrival
                          </span>
                        )}
                        {product.isBespokeAvailable && (
                          <span className="text-charcoal-text/60">
                            • Made-to-measure
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-2 text-charcoal-text hover:text-antique-gold hover:bg-surface-container transition-colors"
                          title="Edit Full Garment Specifications"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          disabled={isDuplicatingId === product.id}
                          className="p-2 text-charcoal-text hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
                          title="Duplicate Item"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          disabled={isDeletingId === product.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-charcoal-text/60 font-sans text-xs space-y-2">
            <p>No couture creations matching your search filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStockFilter('all');
              }}
              className="text-antique-gold underline hover:text-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Stock Tuning Modal */}
      {stockEditingVariantId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 max-w-sm w-full shadow-2xl space-y-4 text-xs font-sans">
            <h3 className="font-serif text-lg text-charcoal-text">Quick Inventory Stock Update</h3>
            <p className="text-charcoal-text/70">
              Adjust current available warehouse/atelier unit count for this variant:
            </p>

            {stockErrorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>{stockErrorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="font-semibold text-charcoal-text">Units in Stock:</label>
              <input
                type="number"
                min={0}
                value={stockEditingValue}
                onChange={e => setStockEditingValue(Number(e.target.value))}
                className="p-2 text-base font-semibold w-24 text-center bg-background border border-outline-variant focus:border-antique-gold"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => {
                  setStockEditingVariantId(null);
                  setStockErrorMsg(null);
                }}
                className="px-4 py-2 border border-outline-variant bg-surface-container hover:bg-surface-container-high text-charcoal-text"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                disabled={isSavingStock}
                className="px-4 py-2 bg-primary text-ivory-base font-semibold hover:bg-charcoal-text disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingStock && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingStock ? 'Saving...' : 'Update Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
