export interface ProgressionEntity {
  id: number;
  slug: string;
  category: string;
  village: string;
  subType?: string;
  requiredHallLevel?: number;
  maxLevel: number;
}