import { ConnectError } from "@farcaster/connect";
import { Dialog } from "../Dialog/index.ts";
import { ErrorMessage } from "../ErrorMessage/index.ts";
import { button } from "../styles.css.ts";
import { body, qrCodeImage, siwfHeading } from "./QRCodeDialog.css.ts";

export function QRCodeDialog({
  open,
  onClose,
  qrCodeUri,
  connectUri,
  isError,
  error,
}: {
  open: boolean;
  onClose: () => void;
  qrCodeUri: string;
  connectUri: string;
  isError: boolean;
  error?: ConnectError;
}) {
  return (
    <Dialog open={open} titleId="Sign In With Farcaster" onClose={onClose}>
      <div className={body}>
        {isError ? (
          <ErrorMessage error={error} />
        ) : (
          <>
            <div className={siwfHeading}>Sign in with Farcaster</div>
            <div>Scan with your phone's camera</div>
            <img src={qrCodeUri} className={qrCodeImage} alt="Sign in With Farcaster QR Code" />
            <div>
              On your phone already?{" "}
              <a
                style={{
                  textDecoration: "none",
                }}
                href={connectUri}
                target="_blank"
                rel="noreferrer"
              >
                <button
                  className={button}
                  type="button"
                  style={{
                    display: "inline",
                    marginLeft: 6,
                  }}
                >
                  Open
                </button>
              </a>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
