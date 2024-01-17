import { useRef, useState } from "react";
import { secondaryButton } from "../styles.css.ts";
import useDetectClickOutside from "../../hooks/useDetectClickOutside.ts";

interface UserDataProps {
  fid?: number;
  pfpUrl?: string;
  username?: string;
}

function SignOutButton({ signOut }: { signOut?: () => void }) {
  return (
    <button
      type="button"
      className={secondaryButton}
      style={{
        marginTop: "12px",
        fontWeight: "400",
        boxShadow: "0px 6px 12px 0 rgba(0,0,0,0.12)",
      }}
      onClick={signOut}
    >
      <svg
        width="19"
        height="20"
        viewBox="0 0 19 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: "9px" }}
      >
        <path
          d="M11.75 7V3.25C11.75 2.65326 11.5129 2.08097 11.091 1.65901C10.669 1.23705 10.0967 1 9.5 1H3.5C2.90326 1 2.33097 1.23705 1.90901 1.65901C1.48705 2.08097 1.25 2.65326 1.25 3.25V16.75C1.25 17.3467 1.48705 17.919 1.90901 18.341C2.33097 18.7629 2.90326 19 3.5 19H9.5C10.0967 19 10.669 18.7629 11.091 18.341C11.5129 17.919 11.75 17.3467 11.75 16.75V13M14.75 13L17.75 10M17.75 10L14.75 7M17.75 10H5"
          stroke="black"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Sign out
    </button>
  );
}

export function ProfileButton({
  userData,
  signOut,
}: {
  userData?: UserDataProps;
  signOut?: () => void;
}) {
  const [showSignOut, setShowSignOut] = useState(false);
  const ref = useRef(null);
  useDetectClickOutside(ref, () => setShowSignOut(false));

  const name = userData?.username ?? `!${userData?.fid}`;
  const pfpUrl = userData?.pfpUrl ?? "https://warpcast.com/avatar.png";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
      }}
      ref={ref}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <button
          type="button"
          className={secondaryButton}
          onClick={() => setShowSignOut(!showSignOut)}
        >
          <img
            style={{
              objectFit: "cover",
              width: 28,
              height: 28,
              borderRadius: 28,
            }}
            src={pfpUrl}
            alt="avatar"
          />
          <span style={{ marginLeft: 9, marginRight: 12 }}>{name}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.5">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.26418 9.864C6.43293 9.69545 6.66168 9.60079 6.90018 9.60079C7.13869 9.60079 7.36743 9.69545 7.53618 9.864L12.0002 14.328L16.4642 9.864C16.5466 9.77557 16.6459 9.70465 16.7563 9.65546C16.8667 9.60627 16.9859 9.57982 17.1068 9.57769C17.2276 9.57555 17.3476 9.59778 17.4597 9.64305C17.5718 9.68831 17.6736 9.75569 17.759 9.84115C17.8445 9.92661 17.9119 10.0284 17.9571 10.1405C18.0024 10.2525 18.0246 10.3726 18.0225 10.4934C18.0204 10.6143 17.9939 10.7334 17.9447 10.8438C17.8955 10.9542 17.8246 11.0536 17.7362 11.136L12.6362 16.236C12.4674 16.4045 12.2387 16.4992 12.0002 16.4992C11.7617 16.4992 11.5329 16.4045 11.3642 16.236L6.26418 11.136C6.09564 10.9672 6.00098 10.7385 6.00098 10.5C6.00098 10.2615 6.09564 10.0327 6.26418 9.864Z"
                fill="black"
              />
            </g>
          </svg>
        </button>
        {showSignOut && <SignOutButton signOut={signOut} />}
      </div>
    </div>
  );
}
