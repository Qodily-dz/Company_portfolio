import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Arrow — a small directional arrow for CTAs and links.
 *
 * Moves forward on hover (slid via its own group-hover translate). Use
 * `external` to render the ↗ glyph for outbound actions (WhatsApp, social,
 * external case links). The arrow keeps its own motion so it feels separate
 * from the button it lives in.
 * ------------------------------------------------------------------------- */

type ArrowProps = {
  external?: boolean;
  className?: string;
};

export function Arrow({ external = false, className }: ArrowProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block transition-transform duration-200 group-hover:translate-x-0.5",
        external && "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
        className
      )}
    >
      {external ? "↗" : "→"}
    </span>
  );
}
