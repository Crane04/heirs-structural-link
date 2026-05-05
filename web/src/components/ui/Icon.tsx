import type { SVGProps } from 'react';

export type IconName =
  | 'arrow-right'
  | 'ban'
  | 'camera'
  | 'check'
  | 'chevron-down'
  | 'circle'
  | 'grid'
  | 'refresh'
  | 'report'
  | 'scan'
  | 'search'
  | 'settings'
  | 'spark';

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
  title?: string;
};

export default function Icon({ name, title, ...props }: Props) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  } as const;

  const strokeProps = {
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  return (
    <svg {...common} aria-hidden={title ? undefined : true} role={title ? 'img' : 'presentation'} {...props}>
      {title ? <title>{title}</title> : null}

      {name === 'arrow-right' && (
        <path {...strokeProps} d="M5 12h12m0 0-5-5m5 5-5 5" />
      )}

      {name === 'chevron-down' && <path {...strokeProps} d="M6 9l6 6 6-6" />}

      {name === 'check' && <path {...strokeProps} d="M20 6 9 17l-5-5" />}

      {name === 'circle' && <path {...strokeProps} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />}

      {name === 'refresh' && <path {...strokeProps} d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6" />}

      {name === 'camera' && (
        <>
          <path {...strokeProps} d="M9 7 10.5 5h3L15 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3Z" />
          <path {...strokeProps} d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </>
      )}

      {name === 'ban' && (
        <>
          <path {...strokeProps} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
          <path {...strokeProps} d="M7 7l10 10" />
        </>
      )}

      {name === 'grid' && (
        <>
          <path {...strokeProps} d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
        </>
      )}

      {name === 'scan' && (
        <>
          <path {...strokeProps} d="M7 3H5a2 2 0 0 0-2 2v2m18 0V5a2 2 0 0 0-2-2h-2M7 21H5a2 2 0 0 1-2-2v-2m18 0v2a2 2 0 0 1-2 2h-2" />
          <path {...strokeProps} d="M8 12h8" />
        </>
      )}

      {name === 'report' && (
        <>
          <path {...strokeProps} d="M7 3h8l2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...strokeProps} d="M8 11h8M8 15h8M8 7h4" />
        </>
      )}

      {name === 'settings' && (
        <>
          <path
            {...strokeProps}
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          />
          <path
            {...strokeProps}
            d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.4-2.3.5a7.6 7.6 0 0 0-1.7-1L15 6.6 11 6l-.5 2.3a7.6 7.6 0 0 0-1.7 1l-2.3-.5-2 3.4 2 1.2a7.9 7.9 0 0 0 .1 1l-2 1.2 2 3.4 2.3-.5a7.6 7.6 0 0 0 1.7 1L11 21.4l4 .6.5-2.3a7.6 7.6 0 0 0 1.7-1l2.3.5 2-3.4-2.1-1.2Z"
          />
        </>
      )}

      {name === 'search' && (
        <>
          <path {...strokeProps} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
          <path {...strokeProps} d="M21 21l-4.3-4.3" />
        </>
      )}

      {name === 'spark' && (
        <>
          <path {...strokeProps} d="M12 2l1.4 5.2L19 9l-5.6 1.8L12 16l-1.4-5.2L5 9l5.6-1.8L12 2Z" />
          <path {...strokeProps} d="M4 14l.8 2.8L8 18l-3.2 1.2L4 22l-.8-2.8L0 18l3.2-1.2L4 14Z" />
        </>
      )}
    </svg>
  );
}
