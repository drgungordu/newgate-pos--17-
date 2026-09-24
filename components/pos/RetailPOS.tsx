import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, RotateCcw, Search, Plus, Minus, Trash2, CheckCircle2, User, CreditCard, DollarSign } from 'lucide-react';
import { RetailService } from '../../services/retailService';
import { ScannerService } from '../../services/scannerService';
import { CustomerDisplayService } from '../../services/customerDisplayService';
import { OrderService } from '../../services/orderService';
import { PaymentService } from '../../services/paymentService';
import { RetailProduct, ProductVariant } from '../../types/retail';
import { Employee } from '../../types';
import { RetailReturnsModal } from './RetailReturnsModal';

export interface RetailPOSProps {
  currentUser: Employee;
  onExit: () => void;
  onOpenReturns?: () => void;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantLabel?: string;
}

export const RetailPOS: React.FC<RetailPOSProps> = ({ currentUser, onExit, onOpenReturns }) => {
  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showReturns, setShowReturns] = useState(false);

  useEffect(() => {
    RetailService.listProducts().then(setProducts);
    const unsub = ScannerService.subscribe(handleBarcodeScanned);
    return () => {
      unsub();
      CustomerDisplayService.resetToIdle();
    };
  }, []);

  const handleBarcodeScanned = (barcode: string) => {
    void RetailService.lookupBarcode(barcode).then(match => {
      if (match) handleAddToCart(match.product, match.variant);
    });
  };

  const handleAddToCart = (product: RetailProduct, variant?: ProductVariant) => {
    const productId = variant ? `${product.id}:${variant.id}` : product.id;
    const price = variant?.price ?? product.basePrice;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          productId,
          name: variant ? `${product.name} (${variant.size || variant.color || variant.sku})` : product.name,
          price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleCheckout = async (paymentMethod: 'CARD' | 'CASH') => {
    try {
      const order = await OrderService.createOrder({
        total,
        paymentMethod: paymentMethod === 'CARD' ? 'Card' : 'Cash',
        employeeName: currentUser.name,
        type: 'Retail',
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: 'Retail',
        })),
      });
      const payment = await PaymentService.processPayment({
        orderId: order.id,
        amount: total,
        method: paymentMethod,
      });
      if (payment.status !== 'APPROVED') throw new Error(payment.error || `Payment ${payment.status.toLowerCase()}.`);
      CustomerDisplayService.updateDisplay({ screenMode: 'THANK_YOU', total });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutSuccess(false);
        setCart([]);
        CustomerDisplayService.resetToIdle();
      }, 1500);
    } catch {
      setIsCheckingOut(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>App Hub</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-bold text-white tracking-wide uppercase">Retail Register</span>
        </div>

        <div className="flex items-center space-x-4">
          <>
            <button
              onClick={() => onOpenReturns ? onOpenReturns() : setShowReturns(true)}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-semibold transition-colors"
            >
              <RotateCcw size={14} />
              <span>Returns & Exchanges</span>
            </button>
          </>
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-750">
            <User size={12} className="text-indigo-400" />
            <span className="text-white font-semibold">{currentUser.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pr-1">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddToCart(p)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all duration-200 flex flex-col justify-between group shadow-md"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <h4 className="font-bold text-white text-base mt-2 group-hover:text-indigo-300 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 mt-1">{p.sku}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-black text-white text-lg">${p.basePrice.toFixed(2)}</span>
                  <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={18} className="text-indigo-400" />
              <h3 className="font-bold text-white text-base">Current Cart</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <ShoppingBag size={32} className="opacity-30" />
                <p className="text-xs">Scan barcode or select an item</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h5 className="font-bold text-white text-sm truncate">{item.name}</h5>
                    <p className="text-xs text-indigo-400 font-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => (item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, -1))}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm w-5 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax</span>
                <span className="text-white font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total</span>
                <span className="text-indigo-400 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <span>Tender ${total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      <RetailReturnsModal isOpen={showReturns} currentUser={currentUser} onClose={() => setShowReturns(false)} />

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-6 text-center">
            {checkoutSuccess ? (
              <div className="py-8 space-y-3">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-white">Payment Approved</h3>
                <p className="text-xs text-slate-400">Transaction complete. Dispensing receipt...</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-2xl font-black text-white">Complete Sale</h3>
                  <p className="text-3xl font-black text-indigo-400 mt-2 font-mono">${total.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCheckout('CARD')}
                    className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex flex-col items-center justify-center space-y-2 transition-all group"
                  >
                    <CreditCard size={28} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Credit / Debit</span>
                  </button>

                  <button
                    onClick={() => handleCheckout('CASH')}
                    className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex flex-col items-center justify-center space-y-2 transition-all group"
                  >
                    <DollarSign size={28} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Exact Cash</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailPOS;
