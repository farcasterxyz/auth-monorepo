"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthClientError, type PollStatusTillSuccessReturnType } from "@farcaster/auth-client";
import useSignIn from "../../hooks/useSignIn.js";
import { ActionButton } from "../ActionButton/index.js";
import { ProfileButton } from "../ProfileButton/index.js";
import { QRCodeDialog } from "../QRCodeDialog/index.js";
import { isMobile, type MaybePromise } from "../../utils.js";
import { type CreateChannelParameters } from "../../actions/createChannel.js";
import { type SignInParameters } from "../../actions/signIn.js";
import { type Omit } from "../../types/utils.js";
import { useCreateChannel } from "../../hooks/useCreateChannel.js";

type SignInButtonProps = NonNullable<CreateChannelParameters> &
  Omit<SignInParameters, "channelToken"> & {
    onSignIn?: (signInData: PollStatusTillSuccessReturnType & { isAuthenticated: boolean }) => MaybePromise<unknown>;
    onSignOut?: () => MaybePromise<unknown>;
    onSignInError?: (error: unknown) => MaybePromise<unknown>;
    hideSignOut?: boolean;
  };

export function SignInButton({ hideSignOut, onSignOut, onSignInError, onSignIn, ...signInArgs }: SignInButtonProps) {
  const { status: signInStatus, data: signInData, error: signInError, signIn, signOut, reset } = useSignIn();

  const {
    data: createChannelData,
    status: createChannelDataStatus,
    error: createChannelError,
    refetch: recreateChannel,
  } = useCreateChannel(signInArgs);

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
          const { data: recreateChannelData } = await recreateChannel();
          if (recreateChannelData?.channelToken) {
            reset();
            signIn({
              channelToken: recreateChannelData.channelToken,
              timeout: signInArgs.timeout,
              interval: signInArgs.interval,
            });
          }
        })();
        return;
      }
      onSignInError?.(signInError);
    }
  }, [signInStatus, onSignIn, signInData, signInError, onSignInError, recreateChannel, reset, signIn, signInArgs]);

  const handleSignOut = useCallback(() => {
    setShowDialog(false);
    signOut();
    recreateChannel();
    onSignOut?.();
  }, [signOut, recreateChannel, onSignOut]);

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(async () => {
    if (signInStatus === "error") {
      signOut();
    }
    setShowDialog(true);

    if (!createChannelData) throw new Error("Missing `createChannelData`");
    signIn({ ...signInArgs, channelToken: createChannelData.channelToken });
    if (isMobile()) {
      window.location.href = createChannelData.url;
    }
  }, [signInStatus, signIn, createChannelData, signInArgs, signOut]);

  return (
    <div className="fc-authkit-signin-button">
      {signInStatus === "success" && signInData.isAuthenticated ? (
        <ProfileButton userData={signInData} signOut={handleSignOut} hideSignOut={!!hideSignOut} />
      ) : (
        <>
          <ActionButton disabled={createChannelDataStatus !== "success"} onClick={onClick} label="Sign in" />
          {createChannelDataStatus === "success" ? (
            <QRCodeDialog
              variant="success"
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              url={createChannelData.url}
            />
          ) : createChannelDataStatus === "error" ? (
            <QRCodeDialog
              variant="error"
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              error={createChannelError}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
