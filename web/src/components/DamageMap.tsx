interface DamageMapProps {
  damagedZones: string[];
  fraudFlagged?: boolean;
}

const ZONE_COLORS = {
  damaged:  '#E74C3C',
  flagged:  '#F4A61D',
  normal:   '#1C3A52',
  stroke:   '#028090',
};

// Top-down car SVG with named zones
// Replace path data with Fodunrin's exported SVG paths
export default function DamageMap({ damagedZones, fraudFlagged }: DamageMapProps) {
  function zoneColor(zone: string): string {
    if (!damagedZones.includes(zone)) return ZONE_COLORS.normal;
    return fraudFlagged ? ZONE_COLORS.flagged : ZONE_COLORS.damaged;
  }

  return (
    <svg
      viewBox="0 0 300 500"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[220px] mx-auto"
    >
      {/* Front bumper */}
      <path
        id="front_bumper"
        d="M80 20 L220 20 L230 60 L70 60 Z"
        fill={zoneColor('front_bumper')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Front left door */}
      <path
        id="front_left_door"
        d="M70 60 L130 60 L130 200 L60 200 L70 60 Z"
        fill={zoneColor('front_left_door')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Front right door */}
      <path
        id="front_right_door"
        d="M170 60 L230 60 L240 200 L170 200 Z"
        fill={zoneColor('front_right_door')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Rear left door */}
      <path
        id="rear_left_door"
        d="M60 200 L130 200 L130 340 L65 340 Z"
        fill={zoneColor('rear_left_door')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Rear right door */}
      <path
        id="rear_right_door"
        d="M170 200 L240 200 L235 340 L170 340 Z"
        fill={zoneColor('rear_right_door')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Rear bumper */}
      <path
        id="rear_bumper"
        d="M65 340 L235 340 L220 480 L80 480 Z"
        fill={zoneColor('rear_bumper')}
        stroke={ZONE_COLORS.stroke}
        strokeWidth="1.5"
      />

      {/* Car body center fill */}
      <rect x="130" y="60" width="40" height="280" fill="#0B1F3A" stroke={ZONE_COLORS.stroke} strokeWidth="1" />

      {/* Zone labels */}
      {[
        { id: 'front_bumper',    x: 150, y: 42,  label: 'FRONT' },
        { id: 'front_left_door', x: 95,  y: 130, label: 'FL' },
        { id: 'front_right_door',x: 205, y: 130, label: 'FR' },
        { id: 'rear_left_door',  x: 95,  y: 270, label: 'RL' },
        { id: 'rear_right_door', x: 205, y: 270, label: 'RR' },
        { id: 'rear_bumper',     x: 150, y: 415, label: 'REAR' },
      ].map(({ id, x, y, label }) => (
        <text
          key={id}
          x={x} y={y}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill={damagedZones.includes(id) ? '#FFFFFF' : '#4A90B8'}
          fontFamily="Arial"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
