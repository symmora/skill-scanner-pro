import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ stats }: { stats?: { skills: number; flagged: number } }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <img src={logo} alt="Aegis Scanner logo" className="size-7 rounded-md shrink-0" />
          <span className="truncate text-[15px] font-semibold tracking-tight">Aegis Scanner</span>
          {stats && (
            <Badge variant="secondary" className="ml-1 hidden sm:inline-flex text-[11px]">
              <ShieldCheck className="mr-1 size-3" />
              {stats.skills} scanned · {stats.flagged} flagged
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user?.name || user?.email ? (
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:block">
              {user.name ?? user.email}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
