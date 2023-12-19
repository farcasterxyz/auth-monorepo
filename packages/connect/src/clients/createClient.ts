export interface ClientConfig {
  relayURI: string;
  version?: string;
}

export interface Client {
  config: ClientConfig;
}

const configDefaults = {
  version: "v1",
};

export const createClient = (config: ClientConfig) => {
  return {
    config: { ...configDefaults, ...config },
  };
};
