import React, { useState, useEffect } from 'react';
import { Package, Search, ClipboardList, ScanLine, Tags, Truck, CreditCard, ArrowLeftRight } from 'lucide-react';
import { RetailService } from '../../services/retailService';
import { RetailProduct } from '../../types/retail';

export const RetailManagement: React.FC = () => {
  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState<'INVENTORY' | 'PRICE_CHECK' | 'RECEIVING' | 'STOCK_COUNT' | 'LABELS' | 'VENDORS' | 'CREDIT'>('INVENTORY');
  const [barcode, setBarcode] = useState('');
  const [count, setCount] = useState<Record<string, number>>({});
  const lookup = products.find(product => product.barcode === barcode || product.sku === barcode || product.variants?.some(variant => variant.barcode === barcode || variant.sku === barcode));

  useEffect(() => {
    RetailService.listProducts().then(setProducts);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Retail Inventory & SKUs</h1>
          </div>
          <p className="text-sm text-slate-500">
            Barcode scanning catalog, size/color variant matrices, and physical inventory tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, name, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['INVENTORY', 'Inventory', Package], ['PRICE_CHECK', 'Price Check', ScanLine], ['RECEIVING', 'Receiving', Truck],
          ['STOCK_COUNT', 'Stock Count', ClipboardList], ['LABELS', 'Barcode / Labels', Tags], ['VENDORS', 'Vendors', Truck], ['CREDIT', 'Store Credit / Exchange', ArrowLeftRight],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveTool(id)} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${activeTool === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {activeTool !== 'INVENTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-black text-slate-900">{activeTool.replace('_', ' ')}</h2>
          {activeTool === 'PRICE_CHECK' && <><input value={barcode} onChange={event => setBarcode(event.target.value)} placeholder="Scan SKU or barcode" className="border rounded-xl px-4 py-2 w-full max-w-md" />{lookup && <p className="font-bold">{lookup.name} - ${lookup.basePrice.toFixed(2)}</p>}</>}
          {activeTool === 'STOCK_COUNT' && products.slice(0, 8).map(product => <label key={product.id} className="flex items-center justify-between max-w-xl"><span>{product.name}</span><input type="number" min="0" value={count[product.id] ?? 0} onChange={event => setCount({ ...count, [product.id]: Number(event.target.value) })} className="border rounded-lg px-3 py-1 w-24" /></label>)}
          {activeTool === 'RECEIVING' && <p className="text-sm text-slate-500">Receive purchase order items by scanning SKU/barcode. Inventory movements are recorded in the ledger.</p>}
          {activeTool === 'LABELS' && <p className="text-sm text-slate-500">Select an item and send its SKU/barcode to the configured label printer.</p>}
          {activeTool === 'VENDORS' && <p className="text-sm text-slate-500">Vendor receiving records are ready for API-backed supplier data.</p>}
          {activeTool === 'CREDIT' && <p className="text-sm text-slate-500">Store credit and exchanges are handled through the Returns & Exchanges workflow.</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Item & Variants</th>
              <th className="p-4">Category</th>
              <th className="p-4">SKU / Barcode</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-900">
                  <div>{p.name}</div>
                  {p.variants && p.variants.length > 0 && (
                    <div className="text-xs text-slate-400 font-normal mt-0.5">
                      {p.variants.length} active variants (
                      {p.variants.map((v) => v.size || v.color || v.sku).join(', ')})
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {p.category}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-500">
                  <div>{p.sku}</div>
                  <div className="text-slate-400">{p.barcode}</div>
                </td>
                <td className="p-4 text-right font-black text-slate-900">
                  ${p.basePrice.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                    In Stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetailManagement;
