import { useCallback, useEffect, useState } from "react";
import { AuthClientError, CompletedStatusAPIResponse } from "@farcaster/auth-client";
import useSignIn from "../../hooks/useSignIn.ts";
import { ActionButton } from "../ActionButton/index.ts";
import { ProfileButton } from "../ProfileButton/index.ts";
import { QRCodeDialog } from "../QRCodeDialog/index.tsx";
import { isMobile, MaybePromise } from "../../utils.ts";
import { useCreateChannel } from "../../index.ts";
import { CreateChannelParameters } from "../../actions/createChannel.ts";
import { SignInParameters } from "../../actions/signIn.ts";
import { Omit } from "../../types/utils.ts";

type SignInButtonProps = NonNullable<CreateChannelParameters> &
  Omit<SignInParameters, "channelToken"> & {
    onSignIn?: (signInData: CompletedStatusAPIResponse & { isAuthenticated: boolean }) => MaybePromise<unknown>;
    onSignOut?: () => MaybePromise<unknown>;
    onSignInError?: (error: unknown) => MaybePromise<unknown>;
    hideSignOut?: boolean;
  };

export function SignInButton({ hideSignOut, onSignOut, onSignInError, onSignIn, ...signInArgs }: SignInButtonProps) {
  const { status: signInStatus, data: signInData, error: signInError, signIn, signOut, reset } = useSignIn();

  const {
    createChannel,
    createChannelAsync,
    data: createChannelData,
    status: createChannelDataStatus,
    error: createChannelError,
  } = useCreateChannel();

  // Create channel on mount
  useEffect(() => {
    createChannel({
      nonce: signInArgs.nonce,
      notBefore: signInArgs.notBefore,
      requestId: signInArgs.requestId,
      expirationTime: signInArgs.expirationTime,
    });
  }, [createChannel, signInArgs]);

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
          const recreateChannelData = await createChannelAsync({
            nonce: signInArgs.nonce,
            notBefore: signInArgs.notBefore,
            requestId: signInArgs.requestId,
            expirationTime: signInArgs.expirationTime,
          });
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
  }, [signInStatus, onSignIn, signInData, signInError, onSignInError, createChannelAsync, reset, signIn, signInArgs]);

  const handleSignOut = useCallback(() => {
    setShowDialog(false);
    signOut();
    createChannel({
      nonce: signInArgs.nonce,
      notBefore: signInArgs.notBefore,
      requestId: signInArgs.requestId,
      expirationTime: signInArgs.expirationTime,
    });
    onSignOut?.();
  }, [signOut, createChannel, signInArgs, onSignOut]);

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
