/**
 * Purpose:
    fetch backend entity payloads
*/

/**
 * Functions:

    fetchManifest()
    fetchBuildings()
    fetchTroops()
    fetchTownHall()
*/

import type {
    EntityData,
    EntityManifest,
} from "@/types/entities";

const API =
  `${process.env.EXPO_PUBLIC_BACKEND_URL}/v1/entities`

export async function fetchManifest() {
  const res = await fetch(
    `${API}/manifest`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch manifest",
    );
  }

  return (await res.json()) as EntityManifest;
}

export async function fetchCategory(
  category: string,
) {
  const res = await fetch(
    `${API}/${category}`,
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${category}`,
    );
  }

  const data = await res.json();

  return Object.values(
    data,
  ) as EntityData[];
}