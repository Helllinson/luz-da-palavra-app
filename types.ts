
export interface DevotionalDay {
  dia: number;
  titulo: string;
  versiculo: string;
  referencia: string;
  leitura: string;
  aplicacao: string;
  oracao: string;
  exercicio: string;
  fraseAncora: string;
}

export interface Volume {
  id: number;
  title: string;
  subtitle: string;
  isAvailable: boolean;
  days: DevotionalDay[];
  imageUrl: string;
  sku?: string;
  price?: number;
}

export interface Entitlements {
  volume_1: boolean;
  volume_2: boolean;
  volume_3: boolean;
  volume_4: boolean;
  combo_4: boolean;
}

export interface UserProgress {
  currentVolumeId: number;
  completedDays: Record<number, number[]>; // VolumeId -> DayNumbers
  favorites: Record<number, number[]>; // VolumeId -> DayNumbers (Salva Dia)
  streak: number;
  lastVisitDate: string | null;
}

export interface DayNote {
  godSpoke: string;
  surrender: string;
  practicalStep: string;
}

export interface CheckIn {
  date: string; // YYYY-MM-DD
  emoji: string;
}

export interface QuickNote {
  date: string;
  text: string;
}

export enum AppScreen {
  HOME = 'home',
  DAY_LIST = 'day_list',
  READER = 'reader',
  NOTES = 'notes',
  PROGRESS = 'progress',
  STATUS_GEN = 'status_gen',
  SETTINGS = 'settings',
  COMMUNITY = 'community',
  ACTIVATE_ACCESS = 'activate_access'
}
