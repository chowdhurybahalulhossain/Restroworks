import React, { useState } from 'react';
import { X, Check, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { MenuItem, MenuItemModifier } from '../../types';
import { usePosStore } from '../../store/posStore';

interface ModifierSelectorModalProps {
  item: MenuItem;
  onClose: () => void;
}

export const ModifierSelectorModal: React.FC<ModifierSelectorModalProps> = ({ item, onClose }) => {
  const { addToCart, locale } = usePosStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    item.variants?.[0]?.id
  );

  // Map of modifierGroupId -> Array of selected MenuItemModifier
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, MenuItemModifier[]>>(() => {
    const initial: Record<string, MenuItemModifier[]> = {};
    item.modifierGroups?.forEach((group) => {
      const defaultMods = group.modifiers.filter((m) => m.isDefault);
      if (defaultMods.length > 0) {
        initial[group.id] = defaultMods;
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleModifier = (groupId: string, modifier: MenuItemModifier, minSelections: number, maxSelections: number) => {
    setSelectedModifiers((prev) => {
      const currentList = prev[groupId] || [];
      const alreadySelected = currentList.some((m) => m.id === modifier.id);

      if (alreadySelected) {
        // Remove selection
        return {
          ...prev,
          [groupId]: currentList.filter((m) => m.id !== modifier.id),
        };
      } else {
        // If single choice (max = 1), replace selection
        if (maxSelections === 1) {
          return {
            ...prev,
            [groupId]: [modifier],
          };
        }
        // Multi choice - verify not exceeding max
        if (currentList.length < maxSelections) {
          return {
            ...prev,
            [groupId]: [...currentList, modifier],
          };
        }
        return prev;
      }
    });
    setValidationError(null);
  };

  // Compute total price with variant delta and modifier additions
  const activeVariant = item.variants?.find((v) => v.id === selectedVariantId);
  const variantDelta = activeVariant?.priceDelta || 0;
  const modifiersPriceSum = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, m) => sum + m.price, 0);

  const totalPrice = item.basePrice + variantDelta + modifiersPriceSum;

  const handleConfirmAddToCart = () => {
    // Validate required modifier groups
    if (item.modifierGroups) {
      for (const group of item.modifierGroups) {
        const selections = selectedModifiers[group.id] || [];
        if (group.isRequired && selections.length < group.minSelections) {
          setValidationError(`Please select at least ${group.minSelections} option in "${group.nameEn}"`);
          return;
        }
      }
    }

    const flatMods = Object.values(selectedModifiers)
      .flat()
      .map((m) => ({
        modifierId: m.id,
        nameEn: m.nameEn,
        price: m.price,
      }));

    addToCart(item, selectedVariantId, flatMods);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel-elevated rounded-3xl border border-white/20 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <img
              src={item.image}
              alt={item.nameEn}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-900 border border-white/10 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  {locale === 'en' ? item.nameEn : item.nameBn}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {item.station}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.descriptionEn}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifiers & Variants Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Variants / Sizes (if present) */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Select Size / Variant
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {item.variants.map((v) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`h-14 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span>{locale === 'en' ? v.nameEn : v.nameBn}</span>
                      {v.priceDelta > 0 && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          +৳{(v.priceDelta / 100).toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modifier Groups */}
          {item.modifierGroups?.map((group) => {
            const currentSelected = selectedModifiers[group.id] || [];
            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {locale === 'en' ? group.nameEn : group.nameBn}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {group.isRequired ? 'Choose 1 option' : `Optional (Max: ${group.maxSelections})`}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    group.isRequired
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {group.isRequired ? 'REQUIRED' : 'OPTIONAL'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.modifiers.map((mod) => {
                    const isSelected = currentSelected.some((m) => m.id === mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModifier(group.id, mod, group.minSelections, group.maxSelections)}
                        className={`min-h-[50px] p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 text-black' : 'border border-white/30 text-transparent'
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-xs font-semibold">
                            {locale === 'en' ? mod.nameEn : mod.nameBn}
                          </span>
                        </div>
                        {mod.price > 0 ? (
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            +৳{(mod.price / 100).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Free</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer & Validation */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col gap-3">
          {validationError && (
            <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Price:</span>
              <span className="text-2xl font-display font-bold text-cyan-400">
                ৳{(totalPrice / 100).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-glow-cyan"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
