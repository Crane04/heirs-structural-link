import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/cn';

type Props = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'soft';
  }
>;

export default function Card({ variant = 'default', className, ...props }: Props) {
  return (
    <div
      {...props}
      className={cn(variant === 'default' ? 'hs-card' : 'hs-card-soft', className)}
    />
  );
}

