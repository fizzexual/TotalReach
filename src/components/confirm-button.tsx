"use client";

import { Button, type ButtonProps } from "@/components/ui";

export function ConfirmButton({
  message = "Are you sure?",
  onClick,
  ...props
}: ButtonProps & { message?: string }) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
