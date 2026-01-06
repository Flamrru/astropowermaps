"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import OnboardingOverlay from "./OnboardingOverlay";

// ============================================
// Types
// ============================================

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingStep;
  sunSign: string;
  isNavigating: boolean;
}

interface OnboardingContextValue {
  state: OnboardingState;
  nextStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY_START = "stella-onboarding-start";
const STORAGE_KEY_COMPLETED = "stella-onboarding-completed";
const STORAGE_KEY_STATE = "stella-onboarding-state"; // Persists active onboarding

// Map steps to expected pages
const STEP_PAGES: Record<OnboardingStep, string> = {
  1: "/home",
  2: "/map",
  3: "/map",
  4: "/calendar",
  5: "/calendar",
};

// ============================================
// Context
// ============================================

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

// ============================================
// Helper: localStorage persistence
// ============================================

interface PersistedState {
  isActive: boolean;
  currentStep: OnboardingStep;
  sunSign: string;
}

function saveState(state: PersistedState) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  }
}

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STATE);
    if (saved) {
      return JSON.parse(saved) as PersistedState;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function clearState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_STATE);
  }
}

// ============================================
// Provider Component
// ============================================

interface OnboardingProviderProps {
  children: ReactNode;
  sunSign?: string;
}

export default function OnboardingProvider({
  children,
  sunSign = "Stargazer",
}: OnboardingProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // State - initialized from localStorage if available
  const [state, setState] = useState<OnboardingState>(() => {
    // Check for persisted state first (survives page navigation)
    const persisted = loadState();
    if (persisted && persisted.isActive) {
      return {
        ...persisted,
        isNavigating: false,
      };
    }
    return {
      isActive: false,
      currentStep: 1,
      sunSign: "Stargazer",
      isNavigating: false,
    };
  });

  // On mount: check if we should START a new onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // Dev shortcuts: ?onboarding=reset | ?onboarding=start
    const onboardingParam = urlParams.get("onboarding");

    if (onboardingParam === "reset") {
      localStorage.removeItem(STORAGE_KEY_START);
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
      clearState();
      setState({
        isActive: false,
        currentStep: 1,
        sunSign: "Stargazer",
        isNavigating: false,
      });
      console.log("🔄 Onboarding reset");
      window.history.replaceState({}, "", pathname);
      return;
    }

    if (onboardingParam === "start") {
      // Clear any previous completion and start fresh
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
      clearState();
      const newState = {
        isActive: true,
        currentStep: 1 as OnboardingStep,
        sunSign: sunSign,
        isNavigating: false,
      };
      setState(newState);
      saveState({ isActive: true, currentStep: 1, sunSign });
      console.log("🎬 Dev: Starting onboarding");
      window.history.replaceState({}, "", pathname);
      return;
    }

    // Check if we should start fresh onboarding
    const shouldStart = localStorage.getItem(STORAGE_KEY_START) === "true";
    const alreadyCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED) === "true";
    const alreadyActive = state.isActive;

    if (shouldStart && !alreadyCompleted && !alreadyActive) {
      localStorage.removeItem(STORAGE_KEY_START);
      const newState = {
        isActive: true,
        currentStep: 1 as OnboardingStep,
        sunSign: sunSign,
        isNavigating: false,
      };
      setState(newState);
      saveState({ isActive: true, currentStep: 1, sunSign });
      console.log("🎬 Starting onboarding");
    }
  }, [sunSign, pathname, state.isActive]);

  // Handle navigation when isNavigating is set
  useEffect(() => {
    if (!state.isActive || !state.isNavigating) return;

    const expectedPage = STEP_PAGES[state.currentStep];

    // If we need to navigate, do it now
    if (pathname !== expectedPage) {
      console.log(`🚀 Navigating to ${expectedPage} for step ${state.currentStep}`);
      router.push(expectedPage);
    } else {
      // We're already on the right page, clear navigating flag
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [state.currentStep, state.isActive, state.isNavigating, pathname, router]);

  // When we arrive at the expected page, clear isNavigating
  useEffect(() => {
    if (!state.isActive || !state.isNavigating) return;

    const expectedPage = STEP_PAGES[state.currentStep];

    if (pathname === expectedPage) {
      // We've arrived! Small delay to let page render first
      console.log(`✅ Arrived at ${expectedPage}, showing step ${state.currentStep}`);
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isNavigating: false }));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, state.currentStep, state.isActive, state.isNavigating]);

  // Next step handler
  const nextStep = useCallback(() => {
    if (state.currentStep >= 5) {
      // Complete onboarding
      localStorage.setItem(STORAGE_KEY_COMPLETED, "true");
      clearState();
      setState(prev => ({ ...prev, isActive: false }));
      return;
    }

    const nextStepNum = (state.currentStep + 1) as OnboardingStep;
    const nextPage = STEP_PAGES[nextStepNum];
    const currentPage = STEP_PAGES[state.currentStep];

    // If step 4 -> 5, dispatch event to switch calendar tab
    if (state.currentStep === 4) {
      window.dispatchEvent(
        new CustomEvent("stella-switch-tab", { detail: "2026" })
      );
    }

    // Save to localStorage so it survives page navigation
    saveState({
      isActive: true,
      currentStep: nextStepNum,
      sunSign: state.sunSign,
    });

    // If navigating to different page, set isNavigating
    if (nextPage !== currentPage) {
      setState(prev => ({
        ...prev,
        currentStep: nextStepNum,
        isNavigating: true,
      }));
    } else {
      setState(prev => ({
        ...prev,
        currentStep: nextStepNum,
      }));
    }
  }, [state.currentStep, state.sunSign]);

  // Complete onboarding handler
  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_COMPLETED, "true");
    clearState();
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Reset handler (for dev testing)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_START);
    localStorage.removeItem(STORAGE_KEY_COMPLETED);
    clearState();
    setState({
      isActive: false,
      currentStep: 1,
      sunSign: "Stargazer",
      isNavigating: false,
    });
  }, []);

  // Only show overlay when active, not navigating, and on correct page
  const expectedPage = STEP_PAGES[state.currentStep];
  const shouldShowOverlay = state.isActive && !state.isNavigating && pathname === expectedPage;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        nextStep,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
      <AnimatePresence>
        {shouldShowOverlay && (
          <OnboardingOverlay
            step={state.currentStep}
            sunSign={state.sunSign}
            onNext={nextStep}
            onComplete={completeOnboarding}
          />
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
}
