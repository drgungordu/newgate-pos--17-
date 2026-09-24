import React, { useState } from 'react';
import { Printer, Smartphone, Mail, X, CheckCircle2 } from 'lucide-react';
import { ReceiptOrderContext, ReceiptDeliveryOption } from './receiptTypes';

interface ReceiptPromptModalProps {
  isOpen: boolean;
  orderContext?: ReceiptOrderContext | null;
  onComplete: (option: ReceiptDeliveryOption) => void;
  onClose: () => void;
}

export const ReceiptPromptModal: React.FC<ReceiptPromptModalProps> = ({
  isOpen,
  orderContext,
  onComplete,
  onClose,
}) => {
  const [deliverySent, setDeliverySent] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (option: ReceiptDeliveryOption) => {
    setDeliverySent(true);
    setTimeout(() => {
      setDeliverySent(false);
      onComplete(option);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 text-center shadow-2xl">
        {deliverySent ? (
          <div className="py-6 space-y-3">
            <CheckCircle2 size={44} className="text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-white">Receipt Sent!</h3>
            <p className="text-xs text-slate-400">Have a wonderful day.</p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">How would you like your receipt?</h3>
              {orderContext && (
                <p className="text-sm font-black text-indigo-400 font-mono">
                  Order #{orderContext.orderNumber || orderContext.orderId.slice(-4)} • ${orderContext.total.toFixed(2)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSelect('PRINT')}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <Printer size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Print</span>
              </button>

              <button
                onClick={() => handleSelect('SMS')}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <Smartphone size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">SMS Text</span>
              </button>

              <button
                onClick={() => handleSelect('EMAIL')}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex flex-col items-center justify-center space-y-2 group transition-all"
              >
                <Mail size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Email</span>
              </button>
            </div>

            <button
              onClick={() => handleSelect('NONE')}
              className="w-full py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors"
            >
              No Receipt Needed
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptPromptModal;
