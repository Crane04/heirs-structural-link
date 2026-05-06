import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'solid' | 'whatsapp';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        variant === 'primary' && 'hs-btn-primary',
        variant === 'secondary' && 'hs-btn-secondary',
        variant === 'solid' && 'hs-btn-solid',
        variant === 'whatsapp' && 'hs-btn-whatsapp',
        props.disabled && 'opacity-50 cursor-not-allowed hover:bg-inherit',
        className
      )}
    />
  );
}
