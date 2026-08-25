'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: ReactNode;
}

/** Thin wrapper around the .btn / .btn-primary / .btn-ghost / .btn-danger tokens in globals.css. */
export function Button({ variant = 'ghost', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}
