import type { MouseEventHandler } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

type MovieActionButtonProps = {
  label: string;
  activeLabel?: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  pending?: boolean;
  compact?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function MovieActionButton({
  label,
  activeLabel,
  icon: Icon,
  active = false,
  disabled = false,
  pending = false,
  compact = false,
  onClick,
  className,
}: MovieActionButtonProps) {
  const text = pending ? "Збереження..." : active ? activeLabel ?? label : label;

  return (
    <button
      type="button"
      aria-label={text}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group/action inline-flex shrink-0 items-center justify-center whitespace-nowrap text-[#eef4ed] transition duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        compact
          ? "relative h-9 w-9 rounded-full bg-[rgba(8,28,53,0.78)] shadow-[0_16px_36px_rgba(2,10,20,0.3)] hover:-translate-y-0.5 hover:bg-[rgba(19,64,116,0.88)]"
          : "gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_18px_45px_rgba(4,15,27,0.24)] hover:-translate-y-0.5",
        active
          ? compact
            ? "bg-[linear-gradient(135deg,rgba(238,244,237,0.95),rgba(141,169,196,0.92))] text-[#0b2545]"
            : "bg-[linear-gradient(135deg,rgba(238,244,237,0.95),rgba(141,169,196,0.92))] text-[#0b2545]"
          : compact
            ? ""
            : "bg-[rgba(11,37,69,0.7)] backdrop-blur-xl hover:bg-[rgba(19,64,116,0.88)]",
        className,
      )}
    >
      <Icon className={cn(compact ? "h-4 w-4" : "h-4 w-4", active && "fill-current")} aria-hidden="true" />
      {compact ? (
        <>
          <span className="sr-only">{text}</span>
          <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-full bg-[rgba(8,28,53,0.92)] px-2 py-1 text-[10px] font-semibold text-[#eef4ed] shadow-[0_10px_20px_rgba(0,0,0,0.28)] group-hover/action:block">
            {text}
          </span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
}
