const pastConfigs: [
  string,
  Record<string, unknown> & {
    __internal__: { migrations: { version: string } };
  }
][] = [];

export default pastConfigs;
