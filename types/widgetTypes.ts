
export type WidgetCacheData = {
  title: string;
  subtitle: string;
  isCrafted?: boolean;
  progress: number;
  showProgress: boolean;
  levelText?: string;
  builderCountText?: string;
  nextUpgradeText?: string;
  dataId?: number;
  type?: any;
  color?: string;
  accountInitials?: string;
  updatedAt?: number;
  renderedAt: number;
  remainingMs?: number;
};

export type MultiWidgetItem = {
  tag: string;
  data: WidgetCacheData;
}