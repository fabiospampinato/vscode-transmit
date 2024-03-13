
/* MAIN */

type Options = {
  servers: Server[]
};

type Server = {
  favorite: string,
  domain: string,
  user: string,
  protocol: string,
  localRoot: string,
  remoteRoot: string
};

/* EXPORT */

export type {Options, Server};
