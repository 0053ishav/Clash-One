import { EntityType } from "./entity";

export interface EntityLevel {
  level: number;

  icon: string;

  name?: {
    en: string;
  };
}

export interface EntityData {
  id: number;

  slug: string;

  type: EntityType;

  village: string;

  subType?: string;

  resource?: string;

  icon?: string;

  name: {
    en: string;
  };

  levels?: Record<string, EntityLevel>;
}

export interface EntityManifest {
  version: string;

  updatedAt: number;

  categories: Record<
    string,
    number
  >;
}