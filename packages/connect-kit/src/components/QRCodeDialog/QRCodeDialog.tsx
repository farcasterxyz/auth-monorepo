import { ConnectError } from "@farcaster/connect";
import { Dialog } from "../Dialog/index.ts";
import { ErrorMessage } from "../ErrorMessage/index.ts";
import { button } from "../styles.css.ts";

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
      <div
        style={{
          fontFamily: "sans-serif",
          backgroundColor: "white",
          padding: "24px 36px",
          width: 360,
          height: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {isError ? (
          <ErrorMessage error={error} />
        ) : (
          <>
            <div>Scan with your phone's camera</div>
            <img
              width="256"
              height="256"
              src={qrCodeUri}
              alt="Sign in With Farcaster QR Code"
            />
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
