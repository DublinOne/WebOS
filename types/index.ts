import React from 'react';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: string;
  url?: string;
  content?: string;
  date: string;
  parentId?: string;
}

export interface VaultItem {
  id: string;
  title: string;
  value: string;
  type: string;
  date: string;
}

export interface WindowInstance {
  id: number;
  appId: string;
  title: string;
  icon: React.ElementType;
  component: React.ElementType;
  props?: any;
  isMinimized: boolean;
  isMaximized: boolean;
  isClosing?: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

export interface AppDefinition {
  id: string;
  title: string;
  icon: React.ElementType;
  component: React.ElementType;
  defaultWidth?: number;
  defaultHeight?: number;
}

export type Theme = 'dark' | 'light' | 'auto';

export type WindowAction =
  | { type: 'OPEN'; app: AppDefinition; props?: any }
  | { type: 'CLOSE'; id: number }
  | { type: 'MINIMIZE'; id: number }
  | { type: 'MAXIMIZE'; id: number }
  | { type: 'FOCUS'; id: number }
  | { type: 'UPDATE_POSITION'; id: number; x: number; y: number }
  | { type: 'UPDATE_SIZE'; id: number; w: number; h: number }
  | { type: 'START_CLOSING'; id: number }
  | { type: 'CYCLE_WINDOWS' };

export interface WindowManagerState {
  windows: WindowInstance[];
  activeId: number | null;
  nextZIndex: number;
}
