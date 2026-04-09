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