import { AuthClientError } from "@farcaster/auth-client";
import { Dialog } from "../Dialog/index.ts";
import { body, siwfHeading, instructions } from "./QRCodeDialog.css.ts";
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
    <Dialog open={open} titleId="Sign In With Farcaster" onClose={onClose}>
      <div className="fc-authkit-qrcode-dialog">
        <div className={body}>
          <Button
            kind="reset"
            onClick={onClose}
            style={{ position: "absolute", top: 19, right: 13 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              fill="none"
            >
              <path
                fill="rgba(0,0,0,0.5)"
                fillRule="evenodd"
                d="M1.15 1.15a.937.937 0 0 1 1.325 0L9 7.674l6.525-6.524a.937.937 0 1 1 1.325 1.325L10.326 9l6.524 6.525a.937.937 0 0 1-1.325 1.325L9 10.326 2.475 16.85a.938.938 0 0 1-1.325-1.325L7.674 9 1.15 2.475a.937.937 0 0 1 0-1.325Z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
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
                Scan with your phone's camera to continue.
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                  marginBottom: 12,
                }}
              >
                <QRCode uri={url} size={264} logoSize={22} logoMargin={12} />
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
