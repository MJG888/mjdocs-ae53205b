import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-b from-primary to-orange-600 text-primary-foreground shadow-[0_4px_0_0_hsl(17,88%,35%),0_6px_12px_-2px_hsl(24,95%,53%,0.4)] hover:shadow-[0_6px_0_0_hsl(17,88%,35%),0_10px_20px_-2px_hsl(24,95%,53%,0.5)] hover:-translate-y-0.5 active:shadow-[0_2px_0_0_hsl(17,88%,35%),0_3px_6px_-2px_hsl(24,95%,53%,0.3)] active:translate-y-0.5",
        destructive: 
          "bg-gradient-to-b from-destructive to-red-700 text-destructive-foreground shadow-[0_4px_0_0_hsl(0,62%,35%),0_6px_12px_-2px_hsl(0,84%,60%,0.4)] hover:shadow-[0_6px_0_0_hsl(0,62%,35%),0_10px_20px_-2px_hsl(0,84%,60%,0.5)] hover:-translate-y-0.5 active:shadow-[0_2px_0_0_hsl(0,62%,35%),0_3px_6px_-2px_hsl(0,84%,60%,0.3)] active:translate-y-0.5",
        outline: 
          "border-2 border-border bg-background shadow-[0_4px_0_0_hsl(220,13%,80%),0_4px_8px_-2px_hsl(220,15%,20%,0.1)] hover:border-primary hover:bg-accent hover:shadow-[0_6px_0_0_hsl(220,13%,75%),0_8px_16px_-2px_hsl(220,15%,20%,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_0_0_hsl(220,13%,85%),0_2px_4px_-2px_hsl(220,15%,20%,0.1)] active:translate-y-0.5",
        secondary: 
          "bg-gradient-to-b from-secondary to-muted text-secondary-foreground shadow-[0_4px_0_0_hsl(220,14%,88%),0_4px_8px_-2px_hsl(220,15%,20%,0.1)] hover:shadow-[0_6px_0_0_hsl(220,14%,85%),0_8px_16px_-2px_hsl(220,15%,20%,0.15)] hover:-translate-y-0.5 active:shadow-[0_2px_0_0_hsl(220,14%,90%),0_2px_4px_-2px_hsl(220,15%,20%,0.1)] active:translate-y-0.5",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:translate-y-0",
        link: 
          "text-primary underline-offset-4 hover:underline",
        hero: 
          "bg-gradient-to-b from-primary via-primary to-orange-600 text-primary-foreground shadow-[0_6px_0_0_hsl(17,88%,30%),0_8px_20px_-2px_hsl(24,95%,53%,0.5),inset_0_1px_0_0_hsl(24,95%,70%)] hover:shadow-[0_8px_0_0_hsl(17,88%,30%),0_14px_30px_-2px_hsl(24,95%,53%,0.6),inset_0_1px_0_0_hsl(24,95%,70%)] hover:-translate-y-1 hover:scale-[1.02] active:shadow-[0_2px_0_0_hsl(17,88%,30%),0_4px_10px_-2px_hsl(24,95%,53%,0.4),inset_0_1px_0_0_hsl(24,95%,70%)] active:translate-y-0.5 active:scale-100",
        "hero-outline": 
          "border-2 border-primary text-primary bg-background/80 backdrop-blur-sm shadow-[0_4px_0_0_hsl(24,95%,45%),0_6px_12px_-2px_hsl(24,95%,53%,0.3)] hover:bg-primary/10 hover:shadow-[0_6px_0_0_hsl(24,95%,45%),0_10px_20px_-2px_hsl(24,95%,53%,0.4)] hover:-translate-y-1 hover:scale-[1.02] active:shadow-[0_2px_0_0_hsl(24,95%,45%),0_3px_6px_-2px_hsl(24,95%,53%,0.2)] active:translate-y-0.5 active:scale-100",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
        xl: "h-14 rounded-2xl px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
