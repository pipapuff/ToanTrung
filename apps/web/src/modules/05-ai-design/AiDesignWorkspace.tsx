'use client';

import React from 'react';
import { StudioProvider } from './StudioContext';
import { StudioLayout } from './layout/StudioLayout';

export function AiDesignWorkspace() {
  return (
    <StudioProvider>
      <StudioLayout />
    </StudioProvider>
  );
}