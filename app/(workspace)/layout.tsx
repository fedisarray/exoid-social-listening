import { requireUser } from "@/lib/auth/dal";
import { AppShell } from "@/features/_shared/components/AppShell";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <AppShell email={user.email}>{children}</AppShell>;
}
