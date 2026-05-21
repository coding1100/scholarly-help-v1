"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { adminBtn } from "@/app/lib/adminButtonStyles";
import {
  IconCheck,
  IconCopy,
  IconLogout,
  IconPencil,
  IconPlus,
  IconSave,
  IconSpinner,
  IconTrash,
  IconX,
} from "@/app/components/Admin/AdminButtonIcons";

export type AdminButtonVariant =
  | "primary"
  | "primaryLg"
  | "danger"
  | "dangerLg"
  | "cancel"
  | "cancelLg"
  | "secondary"
  | "edit"
  | "deleteSm"
  | "add"
  | "remove"
  | "removeLink"
  | "headerEdit"
  | "headerDuplicate"
  | "logout";

const variantClass: Record<AdminButtonVariant, string> = {
  primary: adminBtn.primary,
  primaryLg: adminBtn.primaryLg,
  danger: adminBtn.danger,
  dangerLg: adminBtn.dangerLg,
  cancel: adminBtn.cancel,
  cancelLg: adminBtn.cancelLg,
  secondary: adminBtn.secondary,
  edit: adminBtn.edit,
  deleteSm: adminBtn.deleteSm,
  add: adminBtn.add,
  remove: adminBtn.remove,
  removeLink: adminBtn.removeLink,
  headerEdit: adminBtn.headerEdit,
  headerDuplicate: adminBtn.headerDuplicate,
  logout: adminBtn.logout,
};

const defaultIcon: Partial<Record<AdminButtonVariant, ReactNode>> = {
  primary: <IconCheck />,
  primaryLg: <IconSave />,
  danger: <IconTrash />,
  dangerLg: <IconTrash />,
  cancel: <IconX />,
  secondary: <IconX />,
  edit: <IconPencil />,
  deleteSm: <IconTrash />,
  add: <IconPlus />,
  remove: <IconTrash />,
  removeLink: <IconTrash />,
  headerEdit: <IconPencil />,
  headerDuplicate: <IconCopy />,
  logout: <IconLogout className="h-4 w-4 shrink-0 text-white" />,
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: AdminButtonVariant;
  /** true = default icon, false = none, ReactNode = custom icon */
  icon?: boolean | ReactNode;
  loading?: boolean;
};

export default function AdminButton({
  variant,
  icon = true,
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  let IconNode: ReactNode = null;
  if (loading && (variant === "primary" || variant === "primaryLg")) {
    IconNode = <IconSpinner />;
  } else if (icon === false) {
    IconNode = null;
  } else if (icon !== true && icon != null) {
    IconNode = icon;
  } else {
    IconNode = defaultIcon[variant] ?? null;
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variantClass[variant]} ${className}`.trim()}
      {...rest}
    >
      {IconNode}
      {children}
    </button>
  );
}
