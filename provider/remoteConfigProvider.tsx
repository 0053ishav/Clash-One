import {
    __enableGoblinForTesting,
    getGoblinRemoteConfig,
    initRemoteConfig,
    refreshRemoteConfig,
} from "@/services/remoteConfig/remoteConfigService";
import React, { createContext, useContext, useEffect, useState } from "react";

const RemoteConfigContext = createContext<{
  config: ReturnType<typeof getGoblinRemoteConfig>;
}>({
  config: getGoblinRemoteConfig(),
});

export function RemoteConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState(getGoblinRemoteConfig());

  useEffect(() => {
    const interval = setInterval(
      async () => {
        await refreshRemoteConfig();
        setConfig(getGoblinRemoteConfig());
      },
      10 * 60 * 1000,
    ); // every 10 min

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const boot = async () => {
      await initRemoteConfig();

      if (__DEV__) {
        __enableGoblinForTesting();
      }

      setConfig(getGoblinRemoteConfig());
    };

    boot();
  }, []);

  return (
    <RemoteConfigContext.Provider value={{ config }}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

export function useRemoteConfig() {
  return useContext(RemoteConfigContext);
}
