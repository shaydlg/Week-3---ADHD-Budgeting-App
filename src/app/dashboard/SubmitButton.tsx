"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

type Props = ButtonProps & {
  // If set, an in-app dialog with this message must be confirmed before the
  // form submits. We use a real dialog, not window.confirm: native confirm
  // dialogs can be auto-dismissed or suppressed by the browser, which silently
  // swallowed the submit.
  confirm?: string;
  confirmTitle?: string;
  confirmLabel?: string;
  // Shown while the server action runs (Nielsen: visibility of system status).
  pendingLabel?: string;
};

// A submit button that shows a spinner while its form's server action runs, and
// (optionally) asks for confirmation first. Must be rendered inside a <form>.
export default function SubmitButton({
  confirm,
  confirmTitle = "Please confirm",
  confirmLabel = "Confirm",
  pendingLabel,
  children,
  onClick,
  startIcon,
  disabled,
  color,
  ...rest
}: Props) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const label = pending && pendingLabel ? pendingLabel : children;
  const icon = pending ? <CircularProgress size={16} color="inherit" /> : startIcon;

  if (!confirm) {
    return (
      <Button
        type="submit"
        ref={buttonRef}
        color={color}
        disabled={pending || disabled}
        startIcon={icon}
        onClick={onClick}
        {...rest}
      >
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        type="submit"
        ref={buttonRef}
        color={color}
        disabled={pending || disabled}
        startIcon={icon}
        onClick={(e) => {
          // Ask first: open the dialog instead of submitting now.
          e.preventDefault();
          setOpen(true);
          onClick?.(e);
        }}
        {...rest}
      >
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            color={color ?? "primary"}
            variant="contained"
            onClick={() => {
              setOpen(false);
              // requestSubmit reliably triggers the form's server action.
              buttonRef.current?.form?.requestSubmit();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
