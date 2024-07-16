import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "with-next-auth-app-router",
  description: "Sign In With Farcaster + NextAuth.js Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}