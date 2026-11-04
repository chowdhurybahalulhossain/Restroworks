// ============================================================
// NOVAPOS Phase 4 — 3D Dish Showcase Modal
// Combines 3D interactive viewport, nutrition HUD,
// layer inspection, and instant add-to-order workflow.
// ============================================================

import React, { useState } from 'react';
import { 
  X, Layers, Flame, Heart, AlertTriangle, 
  Plus, Minus, Check, Sparkles, ShoppingBag 
} from 'lucide-react';
import { MenuItem } from '../../types';
import { DishPreview3D } from '../3d/DishPreview3D';
import { usePosStore } from '../../store/posStore';
import { sound } from '../../services/soundFx';

interface DishShowcaseModalProps {
  item: MenuItem;
  onClose: () => void;
}

export const DishShowcaseModal: React.FC<DishShowcaseModalProps> = ({ item, onClose }) => {
  const { addToCart, locale } = usePosStore();
  const [exploded, setExploded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Approximate macro nutrition estimates based on calories
  const protein = Math.round((item.calories * 0.22) / 4);
  const carbs = Math.round((item.calories * 0.48) / 4);
  const fat = Math.round((item.calories * 0.30) / 9);

  const handleAddToCart = () => {
    sound.playAddToCart();
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const isBn = locale === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl glass-panel-elevated rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        {/* Left: 3D Interactive Viewport */}
        <div className="w-full md:w-1/2 h-[340px] md:h-auto relative bg-[#07090e] border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
          <DishPreview3D item={item} exploded={exploded} />

          {/* 3D Tools Controls Bottom Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
            {/* Explode Layers Toggle Button */}
            <button
              onClick={() => {
                sound.playClick(800);
                setExploded(!exploded);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                exploded
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-glow-cyan'
                  : 'bg-black/60 text-slate-200 border-white/15 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{exploded ? 'Collapse View' : 'Explode 3D Layers'}</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
              Drag to Rotate 360°
            </span>
          </div>
        </div>

        {/* Right: Nutrition HUD, Description & Add to Order */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  RESTROWORKS 3D GASTRONOMY
                </span>
                <h2 className="text-2xl font-display font-extrabold text-white mt-0.5">
                  {isBn ? item.nameBn : item.nameEn}
                </h2>
                <div className="text-sm text-slate-400 mt-0.5">
                  {isBn ? item.nameEn : item.nameBn}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price & Dietary Badges */}
            <div className="flex items-center gap-3 my-4">
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                ৳{(item.basePrice / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </div>

              <div className="flex items-center gap-1.5">
                {item.isHalal && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Halal
                  </span>
                )}
                {item.isVeg && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 font-semibold">
                    Vegetarian
                  </span>
                )}
                {item.isVegan && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                    Vegan
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {isBn ? item.descriptionBn : item.descriptionEn}
            </p>

            {/* Macro-Nutrition 3D HUD */}
            <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Macro-Nutritional Values</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {item.calories} kcal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-emerald-400 font-mono">{protein}g</div>
                  <div className="text-[10px] text-slate-400">Protein</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-cyan-400 font-mono">{carbs}g</div>
                  <div className="text-[10px] text-slate-400">Carbs</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs font-bold text-pink-400 font-mono">{fat}g</div>
                  <div className="text-[10px] text-slate-400">Healthy Fats</div>
                </div>
              </div>

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Contains: {item.allergens.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Section */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  sound.playClick(500);
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-mono font-bold text-white text-sm">
                {quantity}
              </span>
              <button
                onClick={() => {
                  sound.playClick(700);
                  setQuantity(quantity + 1);
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Order Button */}
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`flex-1 py-3 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                added
                  ? 'bg-emerald-500 text-black shadow-glow-emerald'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-glow-cyan'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Add to Order · ৳{((item.basePrice * quantity) / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

