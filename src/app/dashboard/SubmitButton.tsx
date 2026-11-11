"use client";

import { useFormStatus } from "react-dom";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type Props = ButtonProps & {
  // If set, the person must OK this message before the form submits. Guards
  // against accidental taps on destructive actions (Nielsen: error prevention).
  confirm?: string;
  // Shown while the server action is running (Nielsen: visibility of status).
  pendingLabel?: string;
};

// A submit button that shows a spinner while its form's server action runs, and
// (optionally) asks for confirmation first. Must be rendered inside a <form>.
export default function SubmitButton({
  confirm,
  pendingLabel,
  children,
  onClick,
  startIcon,
  disabled,
  ...rest
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      startIcon={
        pending ? <CircularProgress size={16} color="inherit" /> : startIcon
      }
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
