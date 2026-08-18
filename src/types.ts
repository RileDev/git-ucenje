export interface WindowState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  active: boolean;
}

export type BgTheme = 'bliss' | 'royale' | 'zune' | 'classic';
export type AssistantChar = 'doge' | 'snake' | 'bonzi';

export interface TerminalEntry {
  input?: string;
  output: string;
  isError?: boolean;
}

export type GitFileStatus = 'untracked' | 'staged' | 'modified' | 'tracked' | 'ignored' | 'conflict';

export interface ProjectFile {
  name: string;
  path: string;
  status: GitFileStatus;
  isDir?: boolean;
  size?: string;
  content?: string;
  icon?: string;
}
