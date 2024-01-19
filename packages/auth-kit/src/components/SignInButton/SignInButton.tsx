import { useCallback, useEffect, useState } from "react";
import useSignIn, { UseSignInArgs } from "../../hooks/useSignIn.ts";
import { ActionButton } from "../ActionButton/index.ts";
import { ProfileButton } from "../ProfileButton/index.ts";
import { QRCodeDialog } from "../QRCodeDialog/index.tsx";
import { isMobile } from "../../utils.ts";
import { AuthClientError, StatusAPIResponse } from "@farcaster/auth-client";
import { debugPanel } from "./SignInButton.css.ts";

type SignInButtonProps = UseSignInArgs & { debug?: boolean };

export function SignInButton({ debug, ...signInArgs }: SignInButtonProps) {
  const { onSuccess, onStatusResponse, onError } = signInArgs;

  const onSuccessCallback = useCallback(
    (res: StatusAPIResponse) => {
      onSuccess?.(res);
    },
    [onSuccess]
  );

  const onStatusCallback = useCallback(
    (res: StatusAPIResponse) => {
      onStatusResponse?.(res);
    },
    [onStatusResponse]
  );

  const onErrorCallback = useCallback(
    (error?: AuthClientError) => {
      onError?.(error);
    },
    [onError]
  );

  const signInState = useSignIn({
    ...signInArgs,
    onSuccess: onSuccessCallback,
    onStatusResponse: onStatusCallback,
    onError: onErrorCallback,
  });
  const {
    signIn,
    signOut,
    reconnect,
    isSuccess,
    isError,
    error,
    url,
    data,
    validSignature,
  } = signInState;

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(() => {
    isError ? reconnect() : signIn();
    setShowDialog(true);
  }, [isError, reconnect, signIn]);

  const authenticated = isSuccess && validSignature;

  useEffect(() => {
    if (url && isMobile()) {
      window.location.href = url;
    }
  }, [url, setShowDialog]);

  return (
    <div className="fc-authkit-signin-button">
      {authenticated ? (
        <ProfileButton userData={data} signOut={signOut} />
      ) : (
        <>
          <ActionButton onClick={onClick} label="Sign in" />
          {url && (
            <QRCodeDialog
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              url={url}
              isError={isError}
              error={error}
            />
          )}
        </>
      )}
      {debug && (
        <div className={debugPanel}>
          <pre>{JSON.stringify(signInState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
