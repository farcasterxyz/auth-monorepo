import { useRef, useState } from "react";
import { secondaryButton } from "../styles.css.ts";
import useDetectClickOutside from "../../hooks/useDetectClickOutside.ts";
import {
  profileButtonContainer,
  profileImage,
  profileName,
} from "./ProfileButton.css.ts";
import { SignOutButton } from "../SignOutButton";

interface UserDataProps {
  fid?: number;
  pfpUrl?: string;
  username?: string;
}

export function ProfileButton({
  userData,
  signOut,
  hideSignOut,
}: {
  userData?: UserDataProps;
  signOut?: () => void;
  hideSignOut: boolean;
}) {
  const [showSignOutButton, setShowSignOutButton] = useState(false);
  const ref = useRef(null);
  useDetectClickOutside(ref, () => setShowSignOutButton(false));

  const name = userData?.username ?? `!${userData?.fid}`;
  const pfpUrl = userData?.pfpUrl ?? "https://warpcast.com/avatar.png";

  const showSignOut = showSignOutButton && !hideSignOut;

  return (
    <div
      className={`fc-authkit-profile-button ${profileButtonContainer}`}
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
          onClick={() => setShowSignOutButton(!showSignOutButton)}
        >
          <img className={profileImage} src={pfpUrl} alt="avatar" />
          <span className={profileName}>{name}</span>
          {!hideSignOut && (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Dropdown</title>
              <g opacity="0.5">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.26418 9.864C6.43293 9.69545 6.66168 9.60079 6.90018 9.60079C7.13869 9.60079 7.36743 9.69545 7.53618 9.864L12.0002 14.328L16.4642 9.864C16.5466 9.77557 16.6459 9.70465 16.7563 9.65546C16.8667 9.60627 16.9859 9.57982 17.1068 9.57769C17.2276 9.57555 17.3476 9.59778 17.4597 9.64305C17.5718 9.68831 17.6736 9.75569 17.759 9.84115C17.8445 9.92661 17.9119 10.0284 17.9571 10.1405C18.0024 10.2525 18.0246 10.3726 18.0225 10.4934C18.0204 10.6143 17.9939 10.7334 17.9447 10.8438C17.8955 10.9542 17.8246 11.0536 17.7362 11.136L12.6362 16.236C12.4674 16.4045 12.2387 16.4992 12.0002 16.4992C11.7617 16.4992 11.5329 16.4045 11.3642 16.236L6.26418 11.136C6.09564 10.9672 6.00098 10.7385 6.00098 10.5C6.00098 10.2615 6.09564 10.0327 6.26418 9.864Z"
                  fill="black"
                />
              </g>
            </svg>
          )}
        </button>
        {showSignOut && <SignOutButton signOut={signOut} />}
      </div>
    </div>
  );
}
