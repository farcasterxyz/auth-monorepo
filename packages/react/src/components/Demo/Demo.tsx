import useSignIn from "../../hooks/useSignIn.ts";
import { SignInButton } from "../SignInButton";

export function Demo() {
  const signIn = useSignIn({
    siweUri: "https://example.com/login",
    domain: "example.com",
  });
  const {
    isSuccess,
    isError,
    error,
    channelToken,
    qrCodeURI,
    data,
    validSignature,
  } = signIn;

  return (
    <div>
      {isError && <div>{error?.message}</div>}
      {!channelToken && <SignInButton onClick={() => signIn?.signIn()} />}
      {qrCodeURI && !isError && !isSuccess && (
        <div>
          <img src={qrCodeURI} alt="qrcode" />
        </div>
      )}
      {isSuccess && validSignature ? (
        <>
          {signIn?.data?.username && (
            <div>
              <img
                style={{
                  objectFit: "cover",
                  width: 80,
                  height: 80,
                  borderRadius: 80,
                }}
                src={signIn?.data?.pfpUrl}
                alt="avatar"
              />
              <p>
                <strong style={{ fontSize: "1.5em" }}>
                  {signIn?.data?.username}
                </strong>
              </p>
              <p>{signIn?.data?.bio}</p>
            </div>
          )}
        </>
      ) : (
        <>{data?.state === "completed" && <div>Unauthorized</div>}</>
      )}
      <hr />
      <div>
        <strong>Channel Token: </strong>
        <code
          style={{ cursor: "pointer" }}
          onKeyUp={() => {}}
          onClick={() => {
            navigator.clipboard.writeText(`"${signIn?.channelToken}"`);
          }}
        >
          {channelToken}
        </code>
      </div>
      <div>
        <pre>{JSON.stringify(signIn, null, 2)}</pre>
      </div>
    </div>
  );
}
