import { primaryButton } from "../styles.css.ts";

interface UserDataProps {
  fid?: number;
  pfpUrl?: string;
  username?: string;
}

export function ProfileButton({ userData }: { userData?: UserDataProps }) {
  const name = userData?.username ?? `!${userData?.fid}`;
  const pfpUrl = userData?.pfpUrl ?? "https://warpcast.com/avatar.png";
  return (
    <button type="button" className={primaryButton}>
      <img
        style={{
          objectFit: "cover",
          width: 20,
          height: 20,
          borderRadius: 20,
        }}
        src={pfpUrl}
        alt="avatar"
      />
      <span style={{ marginLeft: 9 }}>{name}</span>
    </button>
  );
}
