import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "tw-animate-spin tw-rounded-full tw-border-2 tw-border-current tw-border-t-transparent",
  {
    variants: {
      size: {
        default: "tw-h-5 tw-w-5",
        sm: "tw-h-4 tw-w-4",
        lg: "tw-h-8 tw-w-8",
        xl: "tw-h-12 tw-w-12",
      },
      variant: {
        default: "tw-text-primary-500",
        white: "tw-text-white",
        gray: "tw-text-gray-400",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

function Spinner({ className, size, variant, ...props }) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
