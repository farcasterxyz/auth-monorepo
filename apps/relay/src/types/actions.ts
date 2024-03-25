import type { z } from "zod";
import type { CompletedSession, PendingSession, Session } from "./session.js";
import type { sessionCreateSchema } from "../schemas/sessionCreate.js";
import type { sessionAuthenticateSchema } from "../schemas/sessionAuthenticate.js";

export type SessionCreateParameters = z.infer<typeof sessionCreateSchema>;
export type SessionCreateReturnType = PendingSession & { sessionToken: string };

export type SessionAuthenticateParameters = z.infer<typeof sessionAuthenticateSchema>;
export type SessionAuthenticateReturnType = CompletedSession;

export type SessionGetReturnType = Session;
