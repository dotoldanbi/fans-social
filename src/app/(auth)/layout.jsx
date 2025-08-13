import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import Loader from "@/components/Loader";
import ".././globals.css";

export const metadata = {
  title: "Next.js",
  description: "Authentication pages",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <ClerkLoading>
            <Loader />
          </ClerkLoading>
          <ClerkLoaded>{children}</ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
