import Posthog from "posthog-react-native";

export const posthog = new Posthog ("phc_CtZNV9Acb6dsQemdvF5EixQjM8YPQzwVSocsupUJasm7", {
    host: "https://app.posthog.com",
    flushAt: 1,
    flushInterval: 0,
})