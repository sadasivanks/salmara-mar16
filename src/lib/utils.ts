import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { TimelineStep } from "@/types/tracking";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const markCurrentStep = (steps: TimelineStep[]): TimelineStep[] => {
  let foundCurrent = false;

  return steps.map((step, index) => {
    if (!step.completed && !foundCurrent) {
      foundCurrent = true;
      return { ...step, isCurrent: true };
    }

    return {
      ...step,
      isCurrent: false,
    };
  });
};

/**
 * Throttle a function to be called at most once every `limit` milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}