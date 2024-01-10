import { Result } from "neverthrow";

interface RelayErrorOpts {
  message: string;
  cause: Error | RelayError;
  presentable: boolean;
}

export class RelayError extends Error {
  public readonly errCode: RelayErrorCode;

  /* Indicates if error message can be presented to the user */
  public readonly presentable: boolean = false;

  /**
   * @param errCode - the ConnectError code for this message
   * @param context - a message, another Error, or a ConnectErrorOpts
   */
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

    this.name = "ConnectError";
    this.errCode = errCode;
  }
}

/**
 * RelayErrorCode defines all the types of errors that can be raised.
 *
 * A string union type is chosen over an enumeration since TS enums are unusual types that generate
 * javascript code and may cause downstream issues. See:
 * https://www.executeprogram.com/blog/typescript-features-to-avoid
 */
export type RelayErrorCode =
  /* The request did not have valid authentication credentials, retry with credentials  */
  | "unauthenticated"
  /* The authenticated request did not have the authority to perform this action  */
  | "unauthorized"
  /* The request cannot be completed as constructed, do not retry */
  | "bad_request"
  | "bad_request.validation_failure"
  /* The requested resource could not be found */
  | "not_found"
  /* The request could not be completed because the operation is not executable */
  | "not_implemented"
  /* The request could not be completed, it may or may not be safe to retry */
  | "unavailable"
  /* An unknown error was encountered */
  | "unknown";

/** Type alias for shorthand when handling errors */
export type RelayResult<T> = Result<T, RelayError>;
export type RelayAsyncResult<T> = Promise<RelayResult<T>>;
