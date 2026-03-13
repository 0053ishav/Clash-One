export function getEntityIcon(
    dataId: number,
    iconMap: Record<number, any>,
    fallback?: string
) {
    if (dataId in iconMap) {
        return iconMap[dataId];
    }

    if (fallback) {
        return { uri: fallback };
    }

    return require("@/assets/images/builder/builder-complete.png");
}