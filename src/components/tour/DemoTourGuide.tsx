import React, { useEffect, useState, useRef } from 'react';
import { useTourStore, TOUR_STEPS } from '@/stores/tourStore';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DemoTourGuide: React.FC = () => {
  const {
    isTourOpen,
    currentStepIndex,
    hasSeenTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
  } = useTourStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Automatically trigger tour for first-time user after 700ms initial mount delay
  useEffect(() => {
    if (!hasSeenTour && !isTourOpen) {
      const timer = setTimeout(() => {
        startTour();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, isTourOpen, startTour]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Measure and scroll to target element
  useEffect(() => {
    if (!isTourOpen) {
      setTargetRect(null);
      return;
    }

    if (currentStep && currentStep.targetId) {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const updateRect = () => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        };

        // Initial delay to let smooth scroll settle
        const timer = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
          clearTimeout(timer);
          window.removeEventListener('resize', updateRect);
          window.removeEventListener('scroll', updateRect);
        };
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [isTourOpen, currentStepIndex, currentStep]);

  if (!isTourOpen || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Calculate card positioning based on target element
  let cardStyle: React.CSSProperties = {};
  const isTargeted = Boolean(targetRect && currentStep.targetId);

  if (isTargeted && targetRect) {
    const isMobile = window.innerWidth < 768;
    const padding = 16;
    const cardWidth = Math.min(460, window.innerWidth - 32);

    if (isMobile) {
      // Mobile: Anchor near bottom
      cardStyle = {
        position: 'fixed',
        bottom: '24px',
        left: '16px',
        right: '16px',
        zIndex: 60,
      };
    } else {
      // Desktop: Smart positioning relative to target element
      const targetCenterX = targetRect.left + targetRect.width / 2;
      let left = targetCenterX - cardWidth / 2;

      // Ensure card stays on-screen
      if (left < padding) left = padding;
      if (left + cardWidth > window.innerWidth - padding) {
        left = window.innerWidth - cardWidth - padding;
      }

      // Check vertical space (Prefer below target, otherwise above)
      let top = targetRect.bottom + 14;
      if (top + 340 > window.innerHeight) {
        top = Math.max(padding, targetRect.top - 360);
      }

      cardStyle = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${cardWidth}px`,
        zIndex: 60,
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* 1. Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={skipTour}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
      />

      {/* 2. Spotlight Highlight Ring over Active Element */}
      {isTargeted && targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            pointerEvents: 'none',
            zIndex: 55,
          }}
          className="rounded-2xl border-2 border-[#9e783e] shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] ring-4 ring-[#9e783e]/30 transition-all duration-300"
        />
      )}

      {/* 3. Tour Dialog Card */}
      <div
        className={
          !isTargeted
            ? 'fixed inset-0 z-60 flex items-center justify-center p-4'
            : ''
        }
      >
        <motion.div
          ref={cardRef}
          style={isTargeted ? cardStyle : {}}
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="w-full max-w-lg rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-2xl space-y-4 relative z-60"
        >
          {/* Top Header Badge & Close Button */}
          <div className="flex items-center justify-between border-b border-[#e8e0d1] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#faf8f5] text-[#9e783e] border border-[#e8e0d1]">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold text-[#866632] uppercase tracking-wider">
                {currentStep.badge}
              </span>
            </div>

            <button
              onClick={skipTour}
              className="rounded-xl p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Skip Demo Tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#9e783e] shrink-0" />
              {currentStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {currentStep.description}
            </p>
          </div>

          {/* Feature Bullet Points */}
          {currentStep.featureList && currentStep.featureList.length > 0 && (
            <div className="space-y-1.5 bg-[#faf8f5] border border-[#e8e0d1] p-3 rounded-2xl">
              {currentStep.featureList.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Hint / Tip Box */}
          {currentStep.actionHint && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
              <Lightbulb className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px]">{currentStep.actionHint}</span>
            </div>
          )}

          {/* Footer Navigation Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e8e0d1]">
            {/* Step Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'w-6 bg-[#9e783e]'
                      : i < currentStepIndex
                      ? 'w-2 bg-emerald-600'
                      : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Back / Next Buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold shadow-md shadow-[#9e783e]/20 hover:bg-[#866632] transition-all cursor-pointer"
              >
                <span>{isLastStep ? 'Explore Dashboard' : isFirstStep ? 'Start Tour' : 'Next Step'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
