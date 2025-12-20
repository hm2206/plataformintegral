import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "tw-relative tw-w-full tw-rounded-lg tw-border tw-p-4 [&>svg~*]:tw-pl-7 [&>svg+div]:tw-translate-y-[-3px] [&>svg]:tw-absolute [&>svg]:tw-left-4 [&>svg]:tw-top-4 [&>svg]:tw-text-foreground",
  {
    variants: {
      variant: {
        default: "tw-bg-white tw-text-gray-950 tw-border-gray-200",
        destructive: "tw-border-red-500/50 tw-text-red-500 tw-bg-red-50 [&>svg]:tw-text-red-500",
        success: "tw-border-green-500/50 tw-text-green-700 tw-bg-green-50 [&>svg]:tw-text-green-500",
        warning: "tw-border-yellow-500/50 tw-text-yellow-700 tw-bg-yellow-50 [&>svg]:tw-text-yellow-500",
        info: "tw-border-blue-500/50 tw-text-blue-700 tw-bg-blue-50 [&>svg]:tw-text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("tw-mb-1 tw-font-medium tw-leading-none tw-tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("tw-text-sm [&_p]:tw-leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
