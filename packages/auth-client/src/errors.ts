import { Result } from "neverthrow";

interface AuthClientErrorOpts {
  message: string;
  cause: Error | AuthClientError;
  presentable: boolean;
}

export class AuthClientError extends Error {
  public readonly errCode: AuthClientErrorCode;

  /* Indicates if error message can be presented to the user */
  public readonly presentable: boolean = false;

  /**
   * @param errCode - the AuthClientError code for this message
   * @param context - a message, another Error, or a AuthClientErrorOpts
   */
  constructor(errCode: AuthClientErrorCode, context: Partial<AuthClientErrorOpts> | string | Error) {
    let parsedContext: string | Error | Partial<AuthClientErrorOpts>;

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

    this.name = "AuthClientError";
    this.errCode = errCode;
  }
}

/**
 * AuthClientErrorCode defines all the types of errors that can be raised.
 *
 * A string union type is chosen over an enumeration since TS enums are unusual types that generate
 * javascript code and may cause downstream issues. See:
 * https://www.executeprogram.com/blog/typescript-features-to-avoid
 */
export type AuthClientErrorCode =
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
export type AuthClientResult<T> = Result<T, AuthClientError>;
export type AuthClientAsyncResult<T> = Promise<AuthClientResult<T>>;
export type NoneOf<T> = {
  [K in keyof T]: never;
};
export type Unwrapped<T> =
  | (T & {
      isError: false;
      error?: never;
    })
  | (NoneOf<T> & {
      isError: true;
      error?: AuthClientError;
    });
export type AsyncUnwrapped<T> = Promise<Unwrapped<T>>;

export const unwrap = <T>(result: AuthClientResult<T>): Unwrapped<T> => {
  if (result.isErr()) {
    return { error: result.error, isError: true };
  } else {
    return { ...result.value, isError: false };
  }
};
