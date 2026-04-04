import type { Result } from "neverthrow";

interface RelayErrorOpts {
  message: string;
  cause: Error | RelayError;
  presentable: boolean;
}

export class RelayError extends Error {
  public readonly errCode: RelayErrorCode;
  public readonly presentable: boolean = false;

  constructor(errCode: RelayErrorCode, context: Partial<RelayErrorOpts> | string | Error) {
    let parsedContext: string | Error | Partial<RelayErrorOpts>;

    if (typeof context === "string") {
      parsedContext = { message: context };
    } else if (context instanceof Error) {
      parsedContext = { cause: context, message: context.message };
    } else {
      parsedContext = context;
    }

    if (!parsedContext.message) {
      parsedContext.message = parsedContext.cause?.message || "";
    }

    super(parsedContext.message, { cause: parsedContext.cause });

    this.name = "RelayError";
    this.errCode = errCode;
  }
}

export type RelayErrorCode =
  | "unauthenticated"
  | "unauthorized"
  | "bad_request"
  | "bad_request.validation_failure"
  | "not_found"
  | "not_implemented"
  | "unavailable"
  | "unknown";

export type RelayResult<T> = Result<T, RelayError>;
export type RelayAsyncResult<T> = Promise<RelayResult<T>>;
