"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthClientError, type PollSessionTillCompletedReturnType } from "@farcaster/auth-client";
import useSignIn from "../../hooks/useSignIn.js";
import { ActionButton } from "../ActionButton/index.js";
import { ProfileButton } from "../ProfileButton/index.js";
import { QRCodeDialog } from "../QRCodeDialog/index.js";
import { isMobile, type MaybePromise } from "../../utils.js";
import { type CreateSessionParameters } from "../../actions/createSession.js";
import { type SignInParameters } from "../../actions/signIn.js";
import { type Omit } from "../../types/utils.js";
import { useCreateSession } from "../../hooks/useCreateSession.js";

type SignInButtonProps = Omit<NonNullable<CreateSessionParameters>, "siweUri" | "domain"> &
  Omit<SignInParameters, "sessionToken"> & {
    onSignIn?: (signInData: PollSessionTillCompletedReturnType & { isAuthenticated: boolean }) => MaybePromise<unknown>;
    onSignOut?: () => MaybePromise<unknown>;
    onSignInError?: (error: unknown) => MaybePromise<unknown>;
    hideSignOut?: boolean;
  };

export function SignInButton({ hideSignOut, onSignOut, onSignInError, onSignIn, ...signInArgs }: SignInButtonProps) {
  const { status: signInStatus, data: signInData, error: signInError, signIn, signOut, reset } = useSignIn();

  const {
    data: createSessionData,
    status: createSessionDataSession,
    error: createSessionError,
    refetch: recreateSession,
  } = useCreateSession(signInArgs);

  useEffect(() => {
    if (signInStatus === "success") onSignIn?.(signInData);
    if (signInStatus === "error") {
      // if it's a polling error due to the timeout, we recreate the channel
      if (
        signInError instanceof AuthClientError &&
        signInError.errCode === "unavailable" &&
        signInError.message.startsWith("Polling timed out after")
      ) {
        (async () => {
          const { data: recreateSessionData } = await recreateSession();
          if (recreateSessionData?.sessionToken) {
            reset();
            signIn({
              sessionToken: recreateSessionData.sessionToken,
              timeout: signInArgs.timeout,
              interval: signInArgs.interval,
            });
          }
        })();
        return;
      }
      onSignInError?.(signInError);
    }
  }, [signInStatus, onSignIn, signInData, signInError, onSignInError, recreateSession, reset, signIn, signInArgs]);

  const handleSignOut = useCallback(() => {
    setShowDialog(false);
    signOut();
    recreateSession();
    onSignOut?.();
  }, [signOut, recreateSession, onSignOut]);

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(async () => {
    if (signInStatus === "error") {
      signOut();
    }
    setShowDialog(true);

    if (!createSessionData) throw new Error("Missing `createSessionData`");
    signIn({ ...signInArgs, sessionToken: createSessionData.sessionToken });
    if (isMobile()) {
      window.location.href = createSessionData.url;
    }
  }, [signInStatus, signIn, createSessionData, signInArgs, signOut]);

  return (
    <div className="fc-authkit-signin-button">
      {signInStatus === "success" && signInData.isAuthenticated ? (
        <ProfileButton userData={signInData} signOut={handleSignOut} hideSignOut={!!hideSignOut} />
      ) : (
        <>
          <ActionButton disabled={createSessionDataSession !== "success"} onClick={onClick} label="Sign in" />
          {createSessionDataSession === "success" ? (
            <QRCodeDialog
              variant="success"
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              url={createSessionData.url}
            />
          ) : createSessionDataSession === "error" ? (
            <QRCodeDialog
              variant="error"
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              error={createSessionError}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
