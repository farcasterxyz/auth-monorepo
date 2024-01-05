import { useCallback, useEffect, useState } from "react";
import useSignIn, { UseSignInArgs } from "../../hooks/useSignIn.ts";
import { SignInButton } from "../SignInButton";
import { ProfileButton } from "../ProfileButton";
import { QRCodeDialog } from "../QRCodeDialog";
import { isMobile } from "../../utils.ts";

type ConnectButtonProps = UseSignInArgs & { debug?: boolean };

export function ConnectButton({ debug, ...signInArgs }: ConnectButtonProps) {
  const signInState = useSignIn(signInArgs);
  const { signIn, reconnect, isSuccess, isError, error, qrCodeUri, connectUri, data, validSignature } = signInState;

  const [showDialog, setShowDialog] = useState(false);

  const onClick = useCallback(() => {
    isError ? reconnect() : signIn();
    setShowDialog(true);
  }, [isError, reconnect, signIn]);

  const authenticated = isSuccess && validSignature;

  useEffect(() => {
    if (connectUri) {
      if (isMobile()) {
        if (connectUri.startsWith("http")) {
          // Using 'window.open' causes issues on iOS in non-Safari browsers and
          // WebViews where a blank tab is left behind after connecting.
          // This is especially bad in some WebView scenarios (e.g. following a
          // link from Twitter) where the user doesn't have any mechanism for
          // closing the blank tab.
          // For whatever reason, links with a target of "_blank" don't suffer
          // from this problem, and programmatically clicking a detached link
          // element with the same attributes also avoids the issue.
          const link = document.createElement("a");
          link.href = connectUri;
          link.target = "_blank";
          link.rel = "noreferrer noopener";
          link.click();
        } else {
          window.location.href = connectUri;
        }
      }
    }
  }, [connectUri, setShowDialog]);

  return (
    <div>
      {authenticated ? (
        <ProfileButton userData={data} />
      ) : (
        <>
          <SignInButton onClick={onClick} />
          {qrCodeUri && connectUri && (
            <QRCodeDialog
              open={showDialog && !isMobile()}
              onClose={() => setShowDialog(false)}
              qrCodeUri={qrCodeUri}
              connectUri={connectUri}
              isError={isError}
              error={error}
            />
          )}
        </>
      )}
      {debug && (
        <div
          style={{
            zIndex: 10,
            position: "fixed",
            backgroundColor: "white",
            padding: 24,
            bottom: 9,
            boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
            width: 600,
            overflow: "scroll",
          }}
        >
          <pre>{JSON.stringify(signInState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
