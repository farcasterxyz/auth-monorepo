import { secondaryButton } from "../styles.css.ts";
import { signOutButtonContainer, signOutIcon } from "./SignOutButton.css.ts";

export function SignOutButton({ signOut }: { signOut?: () => void }) {
  return (
    <div className={signOutButtonContainer}>
      <button
        type="button"
        className={secondaryButton}
        style={{
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
          className={signOutIcon}
        >
          <title>Sign Out</title>
          <path
            d="M11.75 7V3.25C11.75 2.65326 11.5129 2.08097 11.091 1.65901C10.669 1.23705 10.0967 1 9.5 1H3.5C2.90326 1 2.33097 1.23705 1.90901 1.65901C1.48705 2.08097 1.25 2.65326 1.25 3.25V16.75C1.25 17.3467 1.48705 17.919 1.90901 18.341C2.33097 18.7629 2.90326 19 3.5 19H9.5C10.0967 19 10.669 18.7629 11.091 18.341C11.5129 17.919 11.75 17.3467 11.75 16.75V13M14.75 13L17.75 10M17.75 10L14.75 7M17.75 10H5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Sign out
      </button>
    </div>
  );
}

export default SignOutButton;
