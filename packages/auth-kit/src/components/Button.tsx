import { ButtonHTMLAttributes } from "react";
import { primaryButton, tertiaryButton, resetButton } from "./styles.css";

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "primary" | "tertiary" | "reset";
};

export function Button({ kind = "primary", children, className, ...rest }: Props) {
  return (
    <button className={kindClass[kind]} {...rest}>
      {children}
    </button>
  );
}

const kindClass = {
  primary: primaryButton,
  tertiary: tertiaryButton,
  reset: resetButton,
};
