import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

export function DashboardHeader({
  stats,
}: {
  stats?: { skills: number; flagged: number };
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={logo} alt={t.appName} className="size-7 shrink-0 rounded-md" />
          <span className="truncate text-[15px] font-semibold tracking-tight">
            {t.appName}
          </span>
          {stats && (
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex text-[11px]">
              <ShieldCheck className="mr-1 size-3" />
              {t.scannedFlagged(stats.skills, stats.flagged)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user?.name || user?.email ? (
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:block">
              {user.name ?? user.email}
            </span>
          ) : null}
          <LanguageSwitcher />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-3.5" />
            {t.signOut}
          </Button>
        </div>
      </div>
    </header>
  );
}
