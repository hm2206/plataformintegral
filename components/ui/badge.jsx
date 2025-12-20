import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "tw-inline-flex tw-items-center tw-rounded-full tw-border tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring focus:tw-ring-offset-2",
  {
    variants: {
      variant: {
        default: "tw-border-transparent tw-bg-primary-500 tw-text-white hover:tw-bg-primary-600",
        secondary: "tw-border-transparent tw-bg-gray-100 tw-text-gray-900 hover:tw-bg-gray-200",
        destructive: "tw-border-transparent tw-bg-red-500 tw-text-white hover:tw-bg-red-600",
        outline: "tw-text-gray-950 tw-border-gray-300",
        success: "tw-border-transparent tw-bg-green-500 tw-text-white hover:tw-bg-green-600",
        warning: "tw-border-transparent tw-bg-yellow-500 tw-text-white hover:tw-bg-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
