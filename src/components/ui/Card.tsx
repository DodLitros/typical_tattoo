import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ title?: string }>;

export default function Card({ title, children }: CardProps) {
  return (
    <section className="ui-card">
      {title ? <h3 className="ui-card-title">{title}</h3> : null}
      {children}
    </section>
  );
}
