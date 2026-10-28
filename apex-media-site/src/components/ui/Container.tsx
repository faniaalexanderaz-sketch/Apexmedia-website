import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Container({ children, className = "", as: Tag = "div" }: Props) {
  return (
    <Tag className={`mx-auto w-full max-w-[1480px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}
