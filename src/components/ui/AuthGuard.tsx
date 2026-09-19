import { useAuth } from "@/hooks/useAuth";
import { LoginPage } from "@/features/auth/LoginPage";
import { PageLoader } from "@/components/ui/Loading";

interface Props { children: React.ReactNode; }

export function AuthGuard({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <LoginPage />;
  return <>{children}</>;
}
