import React from 'react';

export interface TimelineStep {
  status: string;
  completed: boolean;
  date?: string | null;
  icon: React.ReactNode;
  isCurrent?: boolean;
  isError?: boolean;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  activity: string;
}
