import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={`ui-button ${className ?? ""}`.trim()} {...props}>
      {children}
    </button>
  );
}
