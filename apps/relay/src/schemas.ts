export const createChannelRequestSchema = {
  $id: "createChannelRequestSchema",
  type: "object",
  properties: {
    siweUri: {
      type: "string",
      format: "uri",
    },
    domain: {
      type: "string",
      pattern: "^[a-zA-Z0-9.-]+(:[0-9]+)?$",
    },
    nonce: {
      type: "string",
    },
    notBefore: {
      type: "string",
      format: "date-time",
    },
    expirationTime: {
      type: "string",
      format: "date-time",
    },
    requestId: {
      type: "string",
    },
    redirectUrl: {
      type: "string",
    },
  },
  required: ["siweUri", "domain"],
  additionalProperties: false,
};

export const authenticateRequestSchema = {
  $id: "authenticateRequestSchema",
  type: "object",
  properties: {
    message: {
      type: "string",
    },
    signature: {
      type: "string",
      pattern: "^0x[a-fA-F0-9]{130}$",
    },
    fid: {
      type: "integer",
    },
    username: {
      type: "string",
      pattern: "^[a-z0-9][a-z0-9-]{0,15}$|^[a-z0-9][a-z0-9-]{0,15}\\.eth$",
    },
    bio: {
      type: "string",
    },
    displayName: {
      type: "string",
    },
    pfpUrl: {
      type: "string",
      format: "uri",
    },
  },
  required: ["message", "signature", "fid"],
  additionalProperties: false,
};
