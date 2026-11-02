import React, { useState } from 'react';
import { Bike, MapPin, Phone, CheckCircle2, Navigation, DollarSign } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

export const RiderPortal: React.FC = () => {
  const [deliveries, setDeliveries] = useState([
    {
      id: 'del-01',
      orderNumber: '#ORD-8821',
      customerName: 'Tanvir Ahmed',
      phone: '+880 1819-234567',
      address: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
      items: '2x Truffle Smash Burger, 1x Truffle Fries, 2x Neon Lagoon',
      totalAmount: 247000, // 2,470 BDT
      paymentType: 'COD (Cash on Delivery)',
      status: 'EN_ROUTE',
    },
    {
      id: 'del-02',
      orderNumber: '#ORD-8824',
      customerName: 'Samira Khan',
      phone: '+880 1712-987654',
      address: 'Apt 4B, Road 68, Gulshan-2, Dhaka',
      items: '1x Angus Ribeye, 1x Molten Lava Cake',
      totalAmount: 390000,
      paymentType: 'PAID (Online SSLCOMMERZ)',
      status: 'PICKED_UP',
    },
  ]);

  const advanceStatus = (delId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === delId) {
          if (d.status === 'ASSIGNED') return { ...d, status: 'PICKED_UP' };
          if (d.status === 'PICKED_UP') return { ...d, status: 'EN_ROUTE' };
          if (d.status === 'EN_ROUTE') return { ...d, status: 'DELIVERED' };
        }
        return d;
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-nova-bg">
      <div className="w-full max-w-md mx-auto h-full flex flex-col glass-panel md:border-x border-white/10">
        {/* Rider Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/30">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Faruk Hossain (Rider)</h3>
              <p className="text-[10px] text-amber-400 font-mono font-medium">Novasphere Fleet Dispatch</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
            ON DUTY
          </span>
        </div>

        {/* Deliveries List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Active Assigned Orders ({deliveries.filter((d) => d.status !== 'DELIVERED').length})
          </h4>

          {deliveries.map((del) => (
            <div
              key={del.id}
              className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-white text-sm">{del.orderNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300">
                  {del.status}
                </span>
              </div>

              <div>
                <div className="font-semibold text-white text-xs">{del.customerName}</div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <a href={`tel:${del.phone}`} className="hover:underline">{del.phone}</a>
                </div>
                <div className="flex items-start gap-1.5 text-slate-400 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{del.address}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">ITEMS:</span>
                <p>{del.items}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">SETTLEMENT:</span>
                  <span className="font-display font-bold text-cyan-400 text-sm">
                    ৳{(del.totalAmount / 100).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">{del.paymentType}</span>
                </div>

                {del.status !== 'DELIVERED' ? (
                  <button
                    onClick={() => advanceStatus(del.id)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    {del.status === 'ASSIGNED' && 'Accept & Pickup'}
                    {del.status === 'PICKED_UP' && 'Start Delivery'}
                    {del.status === 'EN_ROUTE' && 'Mark Delivered'}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivered</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
