interface GhostFrameProps {
  aligned: boolean;
}

// Generic Toyota Camry outline — replace with Fodunrin's SVG exports per car model
export default function GhostFrame({ aligned }: GhostFrameProps) {
  const stroke = aligned ? '#00A896' : 'rgba(255,255,255,0.5)';

  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
    >
      {/* Car body outline */}
      <rect x="20"  y="100" width="360" height="70"  rx="8" fill="none" stroke={stroke} strokeWidth="2.5" strokeDasharray={aligned ? '0' : '8 4'} />
      {/* Roof */}
      <path d="M80 100 Q100 50 160 45 L240 45 Q300 50 320 100Z" fill="none" stroke={stroke} strokeWidth="2.5" strokeDasharray={aligned ? '0' : '8 4'} />
      {/* Wheels */}
      <circle cx="90"  cy="170" r="22" fill="none" stroke={stroke} strokeWidth="2.5" />
      <circle cx="310" cy="170" r="22" fill="none" stroke={stroke} strokeWidth="2.5" />
      {/* Windows */}
      <path d="M95 98 Q108 65 150 60 L195 60 L195 98Z" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
      <path d="M205 98 L205 60 L250 60 Q292 65 305 98Z" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.7" />

      {/* Corner alignment guides */}
      {[
        [10, 90], [390, 90], [10, 180], [390, 180]
      ].map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x + (x < 200 ? 20 : -20)} y2={y} stroke={stroke} strokeWidth="3" />
          <line x1={x} y1={y} x2={x} y2={y + (y < 150 ? 20 : -20)} stroke={stroke} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}
