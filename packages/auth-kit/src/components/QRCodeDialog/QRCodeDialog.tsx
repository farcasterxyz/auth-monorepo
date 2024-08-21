import { AuthClientError } from "@farcaster/auth-client";
import { Dialog } from "../Dialog/index.ts";
import {
  body,
  siwfHeading,
  instructions,
  qrCodeImage,
} from "./QRCodeDialog.css.ts";
import { Button } from "../Button.tsx";
import { QRCode } from "../QRCode.tsx";

export function QRCodeDialog({
  open,
  onClose,
  url,
  isError,
  error,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  isError: boolean;
  error?: AuthClientError;
}) {
  return (
    <Dialog open={open} titleId="Sign in with Farcaster" onClose={onClose}>
      <div className="fc-authkit-qrcode-dialog">
        <div className={body}>
          {isError ? (
            <>
              <div className={siwfHeading}>Error</div>
              <div className={instructions}>
                {error?.message ?? "Unknown error, please try again."}
              </div>
            </>
          ) : (
            <>
              <div className={siwfHeading}>Sign in with Farcaster</div>
              <div className={instructions}>
                To sign in with Farcaster, scan the code below with your phone's
                camera.
              </div>
              <div className={qrCodeImage}>
                <QRCode uri={url} size={200} />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  kind="tertiary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    window.location.href = url;
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={12}
                    height={18}
                    fill="none"
                  >
                    <title>Sign in With Farcaster QR Code</title>
                    <path
                      fill="#7C65C1"
                      fillRule="evenodd"
                      d="M0 3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3Zm4-1.5v.75c0 .414.336.75.75.75h2.5A.75.75 0 0 0 8 2.25V1.5h1A1.5 1.5 0 0 1 10.5 3v12A1.5 1.5 0 0 1 9 16.5H3A1.5 1.5 0 0 1 1.5 15V3A1.5 1.5 0 0 1 3 1.5h1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span style={{ marginLeft: 9 }}>I'm using my phone →</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
