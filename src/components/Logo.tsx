import { ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Brand mark: rounded tile with a scan-line glyph.
 * Replaces the template's abstract SVG, which read as noise at small sizes.
 */
export function Logo({
  className,
  iconClassName,
  onClick,
}: {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <ScanLine className={cn("size-4", iconClassName)} />
    </div>
  );
}
