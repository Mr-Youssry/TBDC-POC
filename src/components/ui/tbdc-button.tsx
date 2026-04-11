"use client";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface TbdcButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-text-1 text-background hover:opacity-90 shadow-sm font-medium",
  secondary: "border border-border bg-surface text-text-2 hover:bg-surface-2 hover:text-text-1",
  ghost: "text-text-3 hover:bg-surface-2 hover:text-text-1",
  danger: "bg-red-600 text-white hover:bg-red-700 font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs rounded",
  md: "px-4 py-1.5 text-sm rounded",
};

export const TbdcButton = forwardRef<HTMLButtonElement, TbdcButtonProps>(
  ({ variant = "primary", size = "sm", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center transition-all flex-shrink-0",
          variantStyles[variant],
          sizeStyles[size],
          disabled ? "opacity-40 cursor-not-allowed" : "",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

TbdcButton.displayName = "TbdcButton";
