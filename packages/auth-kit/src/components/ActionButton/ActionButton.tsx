import { FarcasterLogo } from "../FarcasterLogo.tsx";
import { Button } from "../Button.tsx";

export function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button kind="primary" onClick={onClick}>
      <FarcasterLogo height={20} fill="white" />
      <span style={{ marginLeft: 9 }}>{label}</span>
    </Button>
  );
}
