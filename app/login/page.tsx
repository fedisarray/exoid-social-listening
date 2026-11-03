import { LoginScreen } from "@/features/auth/screens/LoginScreen";
export default function Page() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const local =
    url &&
    URL.canParse(url) &&
    ["localhost", "127.0.0.1"].includes(new URL(url).hostname);
  const devInboxUrl =
    process.env.NODE_ENV === "development" && local
      ? "http://127.0.0.1:55324"
      : undefined;
  return <LoginScreen devInboxUrl={devInboxUrl} />;
}
