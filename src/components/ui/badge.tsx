import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-800 text-zinc-200",
        secondary:
          "border-zinc-700 bg-zinc-900 text-zinc-300",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400",
        outline: "text-zinc-300 border-zinc-700",
        lime: "border-lime-500/30 bg-lime-500/10 text-lime-400 font-semibold",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
        violet: "border-violet-500/30 bg-violet-500/10 text-violet-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
