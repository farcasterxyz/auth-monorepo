import { FarcasterLogo } from "../FarcasterLogo.tsx";
import { Button } from "../Button.tsx";

export function ActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button disabled={disabled} kind="primary" onClick={onClick}>
      <FarcasterLogo height={20} fill="white" />
      <span style={{ marginLeft: 9 }}>{label}</span>
    </Button>
  );
}
