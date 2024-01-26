import { useCallback, useEffect, useState } from "react";
import useSignIn, { UseSignInArgs } from "../../hooks/useSignIn.ts";
import { ActionButton } from "../ActionButton/index.ts";
import { ProfileButton } from "../ProfileButton/index.ts";
import { QRCodeDialog } from "../QRCodeDialog/index.tsx";
import { isMobile } from "../../utils.ts";
import { AuthClientError, StatusAPIResponse } from "@farcaster/auth-client";
import { debugPanel } from "./SignInButton.css.ts";

type SignInButtonProps = UseSignInArgs & { debug?: boolean, disableSignOut?: boolean  };

export function SignInButton({ debug, disableSignOut, ...signInArgs }: SignInButtonProps) {
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
    connect,
    reconnect,
    isSuccess,
    isError,
    error,
    channelToken,
    url,
    data,
    validSignature,
  } = signInState;

  const onSignOut = useCallback(() => {
    setShowDialog(false);
    signOut();
  }, [signOut]);

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(() => {
    if (isError) {
      reconnect()
    }
    setShowDialog(true);
    signIn();
    if (url && isMobile()) {
      window.location.href = url;
    }
  }, [isError, reconnect, signIn, url]);

  const authenticated = isSuccess && validSignature;

  useEffect(() => {
    if (!channelToken) {
      connect();
    }
  }, [channelToken, connect]);

  return (
    <div className="fc-authkit-signin-button">
      {authenticated ? (
        <ProfileButton userData={data} signOut={onSignOut} disableSignOut={!!disableSignOut} />
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
