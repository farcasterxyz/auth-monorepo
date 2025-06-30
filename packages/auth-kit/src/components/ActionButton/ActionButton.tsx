import { FarcasterLogo } from "../FarcasterLogo.tsx";
import { Button } from "../Button.tsx";

export function ActionButton({
  label,
  onClick,
  initializing,
}: {
  label: string;
  onClick: () => void;
  initializing: boolean;
}) {
  return (
    <Button kind="primary" onClick={onClick} disabled={initializing}>
      <FarcasterLogo height={20} fill="white" />
      <span style={{ marginLeft: 9 }}>{label}</span>
    </Button>
  );
}
