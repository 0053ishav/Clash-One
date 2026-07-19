/**
 * Purpose:
 * Fetch backend progression payloads.
 */

import { Manifest, ProgressionData } from "@/types/progression";


const API =
  `${process.env.EXPO_PUBLIC_BACKEND_URL}/v2`;

export async function fetchManifest() {
  const res = await fetch(
    `${API}/manifest`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch manifest",
    );
  }

  return (await res.json()) as Manifest;
}

export async function fetchProgressionCategory(
  category: string,
) {
  const res = await fetch(
    `${API}/progression/${category}`,
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch progression category: ${category}`,
    );
  }

  const data = await res.json();

  /**
   * Backend returns as Object keyed by entity ID.
   * Flatten into an array for hydration.
   */
  return Object.values(
    data,
  ) as ProgressionData[];
}