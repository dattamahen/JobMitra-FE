import { FormArray } from '@angular/forms';

// ─── PageHeader ───────────────────────────────────────────────────────────────

export interface PageHeaderAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'raised' | 'stroked' | 'flat' | 'icon';
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
}

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  backButton?: boolean;
  actions?: PageHeaderAction[];
}

// ─── StatGrid ─────────────────────────────────────────────────────────────────

export interface StatTrend {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
}

export interface StatCardConfig {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  color?: 'primary' | 'success' | 'warn' | 'info' | 'accent' | 'neutral';
  trend?: StatTrend;
  clickable?: boolean;
}

export interface StatGridConfig {
  stats: StatCardConfig[];
  columns?: { default: number; tablet: number; mobile: number };
  cardHeight?: string;
  showTrend?: boolean;
}

// ─── ActivityFeed ─────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  timestamp: string;
  type: string;
}

export interface ActivityFeedConfig {
  title: string;
  titleIcon?: string;
  items: ActivityItem[];
  maxItems?: number;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  typeColorMap?: Record<string, 'primary' | 'success' | 'warn' | 'info' | 'neutral'>;
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

export interface SectionCardTitleAction {
  id: string;
  label: string;
  icon?: string;
}

export interface SectionCardConfig {
  title: string;
  icon?: string;
  badge?: string;
  variant?: 'default' | 'flat' | 'highlight';
  collapsible?: boolean;
  titleAction?: SectionCardTitleAction;
}

// ─── MetaRow ──────────────────────────────────────────────────────────────────

export interface MetaItem {
  icon: string;
  text: string;
  href?: string;
  hidden?: boolean;
}

// ─── ChipList ─────────────────────────────────────────────────────────────────

export interface ChipListConfig {
  items: string[];
  maxVisible?: number;
  removable?: boolean;
  size?: 'sm' | 'md';
  variant?: 'skill' | 'tag' | 'badge';
  color?: 'primary' | 'success' | 'warn' | 'info' | 'neutral';
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export type StatusColorVariant = 'success' | 'warn' | 'error' | 'info' | 'neutral' | 'primary';

export interface StatusBadgeConfig {
  value: string;
  colorMap?: Record<string, StatusColorVariant>;
  displayMap?: Record<string, string>;
  size?: 'sm' | 'md';
  pill?: boolean;
}

// ─── PaginationBar ────────────────────────────────────────────────────────────

export interface PaginationBarConfig {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemLabel?: string;
}

// ─── StepperHeader ────────────────────────────────────────────────────────────

export interface StepperStep {
  label: string;
  icon?: string;
}

export interface StepperHeaderConfig {
  steps: StepperStep[];
  currentIndex: number;
}

// ─── ArrayEditor ──────────────────────────────────────────────────────────────

export interface ArrayEditorConfig {
  title: string;
  icon: string;
  iconColor?: string;
  placeholder: string;
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  countSuffix?: string;
  initialItems?: string[];
}

// ─── UploadDropZone ───────────────────────────────────────────────────────────

export interface UploadDropZoneConfig {
  accept: string;
  maxSizeMb?: number;
  hint?: string;
  label?: string;
  processingMessage?: string;
}

// ─── HeroBanner ───────────────────────────────────────────────────────────────

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroBenefit {
  icon: string;
  text: string;
}

export interface HeroBannerConfig {
  badge?: { icon: string; text: string };
  title: string;
  subtitle?: string;
  description?: string;
  stats?: HeroStat[];
  benefits?: HeroBenefit[];
  variant?: 'page' | 'auth';
}

// ─── OutcomeBanner ────────────────────────────────────────────────────────────

export interface OutcomeBannerConfig {
  variant: 'success' | 'info' | 'warn' | 'error';
  icon: string;
  title: string;
  message: string;
}

// ─── ProgressItem ─────────────────────────────────────────────────────────────

export interface ProgressItemAction {
  id: string;
  label: string;
  icon?: string;
}

export interface ProgressItemConfig {
  label: string;
  value: number;
  showPercentage?: boolean;
  actions?: ProgressItemAction[];
}

// ─── ContactList ──────────────────────────────────────────────────────────────

export interface ContactListItem {
  icon: string;
  text: string;
  href?: string;
  hidden?: boolean;
}

// ─── PreferenceList ───────────────────────────────────────────────────────────

export interface PreferenceItem {
  label: string;
  value: string;
  hidden?: boolean;
}

// ─── AsyncButton ──────────────────────────────────────────────────────────────

export interface AsyncButtonConfig {
  label: string;
  loadingLabel?: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn';
  variant?: 'raised' | 'stroked' | 'flat' | 'icon' | 'ai';
  type?: 'button' | 'submit';
  minWidth?: string;
  fullWidth?: boolean;
}
