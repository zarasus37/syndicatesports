import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        profit: "bg-profit/15 text-profit",
        loss: "bg-loss/15 text-loss",
        warn: "bg-warn/15 text-warn",
        outline: "border border-border text-muted-foreground",
        solid: "bg-foreground text-background",
        positive: "bg-profit/15 text-profit",
        negative: "bg-loss/15 text-loss",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
