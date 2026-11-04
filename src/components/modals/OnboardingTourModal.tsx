// ============================================================
// NOVAPOS Phase 5 — Interactive In-App Onboarding Tour
// 5-minute guided interactive walkthrough for new staff,
// covering all 7 critical operating flows and portal apps.
// ============================================================

import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle, ChevronRight, ChevronLeft, X, 
  Monitor, Box, ChefHat, Receipt, ShieldCheck, Play, Award
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { sound } from '../../services/soundFx';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  step: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  description: string;
  highlights: string[];
  tips: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'Universal Suite & Role Navigation',
    subtitle: '12 Connected Portals in a Single System',
    icon: Monitor,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Navigation & Portals',
    description: 'Restroworks provides role-tailored workspaces for every staff member. Switch instantaneously between Cashier POS, KDS, Floor Plan, Inventory Hub, and Kiosk.',
    highlights: [
      'Top Navigation Bar gives instant access to the App Switcher (12 Portals).',
      '4-Digit PIN Quick Switch allows servers to change without logging out.',
      'Offline Indicator displays Dexie.js sync status in real time.',
      'Language toggle switches between English and বাংলা with zero reload.',
    ],
    tips: 'Use the App Switcher icon in the top navbar to jump between views anytime.',
  },
  {
    step: 2,
    title: '2D & 3D Spatial Table Management',
    subtitle: 'Real-Time Floor Plan & Live Status Lighting',
    icon: Box,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Dining Room & Tables',
    description: 'Manage dining zones, table occupancy, and guest covers with our live visual 2D Grid and immersive 3D Spatial Floor Plan.',
    highlights: [
      'Green glow indicates available tables; Blue represents seated guests.',
      'Pulsing Purple shows food ready at pass; Cyan indicates bill requested.',
      'Transfer and Merge tables with automatic order item consolidation.',
      'Toggle between 2D Grid and 3D Spatial View with 360° orbit rotation.',
    ],
    tips: 'In 3D mode, use Left-click drag to rotate and Right-click drag to pan the room.',
  },
  {
    step: 3,
    title: 'High-Speed Order Taking & 3D Gastronomy',
    subtitle: 'Sub-50ms Cart Engine & 360° Dish Inspection',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    badge: 'Ordering & KOT',
    description: 'Take orders in under 10 seconds. Customize complex modifiers, variants, and course fire sequences (Starters → Mains → Desserts).',
    highlights: [
      'Fast category tabs, barcode scanner support, and numeric quick-add.',
      'Mandatory modifier validation (e.g. Steak Doneness, Sauces, Add-ons).',
      '3D Dish Showcase with 360° rotation and layer explode view.',
      'One-click KOT routing to station printers and kitchen display screens.',
    ],
    tips: 'Tap "3D View" on any dish to inspect real-time nutritional macros and ingredients.',
  },
  {
    step: 4,
    title: 'Kitchen Display (KDS) & Bump Workflow',
    subtitle: 'Color-Coded Aging Tickets & Station Routing',
    icon: ChefHat,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Kitchen & Bar Pass',
    description: 'Eliminate lost paper tickets. Kitchen staff receive real-time digital tickets with station-specific filtering and aging timers.',
    highlights: [
      'Tickets change color: Green (0-10m) → Amber (10-20m) → Red (20m+).',
      'Bump individual items or entire orders when prep is completed.',
      'Dedicated station views: Hot Kitchen, Grill, Cocktail Bar, and Dessert.',
      'One-tap 86 out-of-stock toggle updates all terminals instantly.',
    ],
    tips: 'Chefs can tap any item on the KDS screen to mark it ready for the expeditor.',
  },
  {
    step: 5,
    title: 'Audited Billing, Discounts & Split Settlement',
    subtitle: 'Multi-Tender Payments, Cash Drawers & Z-Reports',
    icon: Receipt,
    color: 'from-rose-500 to-pink-600',
    badge: 'Cashier & Settlement',
    description: 'Accurate fiscal compliance with 15% VAT, 10% Service Charge, multi-way bill splitting, and full cashier shift reconciliation.',
    highlights: [
      'Split bills equally N-ways or by individual line items.',
      'Apply VIP promo codes or discounts with Manager PIN override guard.',
      'Settle via Cash (with change calculator), Cards, or SSLCOMMERZ checkout.',
      'Shift closing with physical cash denomination counter & printable Z-Report.',
    ],
    tips: 'Any discount over 15% or bill void requires a manager authorization PIN.',
  },
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNext = () => {
    sound.playClick(800);
    if (isLast) {
      sound.playCashSuccess();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick(600);
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl glass-panel-elevated rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Restroworks 5-Minute Staff Training Tour</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  Step {step.step} of {TOUR_STEPS.length}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick(500);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Tracker Bar */}
        <div className="w-full bg-white/5 h-1.5 flex">
          {TOUR_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`flex-1 transition-all duration-300 ${
                idx <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Hero Banner for Step */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                {step.badge}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{step.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{step.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Key Capabilities Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Core Operational Highlights:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {step.highlights.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Staff Tip */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-cyan-300">Staff Pro-Tip:</span>
              <p className="text-xs text-slate-300 mt-0.5">{step.tips}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isFirst
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-cyan-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-glow-cyan transition-all active:scale-95"
          >
            <span>{isLast ? 'Complete Training' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

