import * as FileSystem from "expo-file-system/legacy";

const ICON_CACHE_DIR =
  `${FileSystem.cacheDirectory}entity-icons/`;

async function ensureDir() {
  const dir =
    await FileSystem.getInfoAsync(
      ICON_CACHE_DIR,
    );

  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(
      ICON_CACHE_DIR,
      {
        intermediates: true,
      },
    );
  }
}

function getFileName(
  url: string,
) {
  return url
    .split("/")
    .pop()
    ?.split("?")[0];
}

export async function cacheEntityIcon(
  url: string,
) {
  if (!url) return null;

  await ensureDir();

  const fileName =
    getFileName(url);

  if (!fileName) {
    return null;
  }

  const localPath =
    `${ICON_CACHE_DIR}${fileName}`;

  const file =
    await FileSystem.getInfoAsync(
      localPath,
    );

  // already cached
  if (file.exists) {
    return localPath;
  }

  try {
    await FileSystem.downloadAsync(
      url,
      localPath,
    );

    return localPath;
  } catch (err) {
    console.log(
      "Failed caching icon",
      err,
    );

    return url;
  }
}