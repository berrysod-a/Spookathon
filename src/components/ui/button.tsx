import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300 active:scale-[0.98]",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 active:scale-[0.98]",
        outline: "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800/80 hover:text-white active:scale-[0.98]",
        ghost: "hover:bg-zinc-800/60 text-zinc-300 hover:text-white",
        destructive: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
        link: "text-lime-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
