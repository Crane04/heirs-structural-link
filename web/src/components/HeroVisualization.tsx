export default function HeroVisualization() {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface2/50 overflow-hidden aspect-[16/10] flex items-center justify-center relative">
      <style>{`
        @keyframes hero-pulse-scan {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes hero-scan-line {
          0% { transform: translateY(-80px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(90px); opacity: 0; }
        }
        .hero-pulse-dot {
          animation: hero-pulse-scan 2.2s ease-in-out infinite;
          transform-origin: center;
        }
        .hero-scan-animation {
          animation: hero-scan-line 3s ease-in-out infinite;
        }
      `}</style>

      <svg
        width="520"
        height="220"
        viewBox="0 0 520 220"
        className="w-full h-full absolute inset-0"
      >
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(116,227,211,0.20)"
              strokeWidth="0.6"
            />
          </pattern>

          <radialGradient id="bgGlow" cx="55%" cy="45%" r="70%">
            <stop offset="0%" stopColor="rgba(116,227,211,0.26)" />
            <stop offset="50%" stopColor="rgba(116,227,211,0.10)" />
            <stop offset="100%" stopColor="rgba(6,20,37,0)" />
          </radialGradient>

          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(6,20,37,0.10)" />
            <stop offset="45%" stopColor="rgba(116,227,211,0.20)" />
            <stop offset="100%" stopColor="rgba(6,20,37,0.10)" />
          </linearGradient>

          <linearGradient
            id="damageGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(248,113,113,0.75)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.25)" />
          </linearGradient>

          <filter id="tealGlow" x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="520" height="220" fill="url(#grid)" />
        <rect width="520" height="220" fill="url(#bgGlow)" />

        {/* HUD frame */}
        <g stroke="rgba(116,227,211,0.45)" strokeWidth="2" fill="none">
          <path d="M24 42v-18h18" />
          <path d="M496 42v-18h-18" />
          <path d="M24 178v18h18" />
          <path d="M496 178v18h-18" />
        </g>

        {/* Car base */}
        <path
          d="M88 136c10-35 38-55 82-62 58-9 160-9 208 0 44 8 71 28 84 62l8 21c2 6-2 12-9 12H76c-7 0-11-6-9-12l8-21Z"
          fill="url(#bodyGradient)"
          stroke="rgba(116,227,211,0.88)"
          strokeWidth="2.2"
          filter="url(#tealGlow)"
        />

        {/* Hood */}
        <path
          d="M92 136c12-28 35-43 76-50l-14 49H92Z"
          fill="rgba(34,197,94,0.20)"
          stroke="rgba(34,197,94,0.55)"
          strokeWidth="1.3"
        />

        {/* Front door */}
        <path
          d="M158 86c25-5 54-7 86-7v56h-90l14-49Z"
          fill="rgba(59,130,246,0.20)"
          stroke="rgba(59,130,246,0.55)"
          strokeWidth="1.3"
        />

        {/* Rear door */}
        <path
          d="M244 79h86l18 56H244V79Z"
          fill="rgba(168,85,247,0.18)"
          stroke="rgba(168,85,247,0.55)"
          strokeWidth="1.3"
        />

        {/* Rear section */}
        <path
          d="M330 79c60 6 94 24 111 56h-93l-18-56Z"
          fill="rgba(245,158,11,0.20)"
          stroke="rgba(245,158,11,0.60)"
          strokeWidth="1.3"
        />

        {/* Roof / cabin */}
        <path
          d="M170 99c18-22 44-31 78-33 52-3 98-2 137 3 29 4 51 13 68 30"
          fill="none"
          stroke="rgba(6,20,37,0.55)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Windows */}
        <path
          d="M190 98c18-15 37-20 67-21h42v34H177c4-5 8-9 13-13Z"
          fill="rgba(255,255,255,0.50)"
          stroke="rgba(116,227,211,0.60)"
          strokeWidth="1.2"
        />
        <path
          d="M306 77h50c28 3 48 11 64 34H306V77Z"
          fill="rgba(255,255,255,0.42)"
          stroke="rgba(116,227,211,0.60)"
          strokeWidth="1.2"
        />

        {/* Bumpers */}
        <path
          d="M68 153h48c8 0 13 5 13 12H78c-7 0-12-5-10-12Z"
          fill="rgba(20,184,166,0.30)"
          stroke="rgba(20,184,166,0.65)"
        />
        <path
          d="M412 153h58c2 7-3 12-10 12h-58c0-7 4-12 10-12Z"
          fill="rgba(20,184,166,0.30)"
          stroke="rgba(20,184,166,0.65)"
        />

        {/* Wheels */}
        <g>
          <circle
            cx="160"
            cy="170"
            r="24"
            fill="rgba(6,20,37,0.12)"
            stroke="rgba(6,20,37,0.30)"
          />
          <circle
            cx="160"
            cy="170"
            r="12"
            fill="rgba(255,255,255,0.35)"
            stroke="rgba(116,227,211,0.35)"
          />
          <circle
            cx="365"
            cy="170"
            r="24"
            fill="rgba(6,20,37,0.12)"
            stroke="rgba(6,20,37,0.30)"
          />
          <circle
            cx="365"
            cy="170"
            r="12"
            fill="rgba(255,255,255,0.35)"
            stroke="rgba(116,227,211,0.35)"
          />
        </g>

        {/* Damage zones */}
        <g>
          <circle
            cx="180"
            cy="128"
            r="18"
            fill="url(#damageGradient)"
            stroke="rgba(239,68,68,0.75)"
            strokeWidth="1.5"
          />
          <circle
            cx="180"
            cy="128"
            r="29"
            fill="none"
            stroke="rgba(239,68,68,0.25)"
            strokeWidth="1.2"
          />

          <circle
            cx="356"
            cy="142"
            r="15"
            fill="url(#damageGradient)"
            stroke="rgba(239,68,68,0.75)"
            strokeWidth="1.5"
          />
          <circle
            cx="356"
            cy="142"
            r="25"
            fill="none"
            stroke="rgba(239,68,68,0.22)"
            strokeWidth="1.2"
          />
        </g>

        {/* Part labels */}
        <g
          fontSize="9"
          fontWeight="700"
          fontFamily="Inter, system-ui"
          fill="rgba(6,20,37,0.72)"
        >
          <text x="105" y="126">
            HOOD
          </text>
          <text x="200" y="122">
            DOOR
          </text>
          <text x="285" y="122">
            CABIN
          </text>
          <text x="380" y="126">
            REAR
          </text>
        </g>

        {/* AI analysis dots */}
        {[
          { cx: 145, cy: 58, d: "0s" },
          { cx: 210, cy: 44, d: "0.4s" },
          { cx: 260, cy: 40, d: "0.8s" },
          { cx: 310, cy: 44, d: "1.2s" },
          { cx: 375, cy: 58, d: "1.6s" },
        ].map((n) => (
          <g key={`${n.cx}-${n.cy}`}>
            <circle cx={n.cx} cy={n.cy} r="7" fill="rgba(116,227,211,0.10)" />
            <circle
              cx={n.cx}
              cy={n.cy}
              r="2.6"
              fill="rgba(116,227,211,0.95)"
              className="hero-pulse-dot"
              style={{ animationDelay: n.d }}
            />
          </g>
        ))}

        <path
          d="M120 68C160 40 210 30 260 30s100 10 140 38"
          fill="none"
          stroke="rgba(116,227,211,0.38)"
          strokeWidth="1.4"
          strokeDasharray="2,6"
        />

        {/* Scan lines */}
        <line
          x1="90"
          y1="110"
          x2="430"
          y2="110"
          stroke="rgba(116,227,211,0.48)"
          strokeWidth="1.1"
          className="hero-scan-animation"
        />
        <line
          x1="90"
          y1="140"
          x2="430"
          y2="140"
          stroke="rgba(116,227,211,0.42)"
          strokeWidth="1.1"
          className="hero-scan-animation"
          style={{ animationDelay: "0.55s" }}
        />
        <line
          x1="90"
          y1="165"
          x2="430"
          y2="165"
          stroke="rgba(116,227,211,0.36)"
          strokeWidth="1.1"
          className="hero-scan-animation"
          style={{ animationDelay: "1s" }}
        />

        {/* Bounding box */}
        <rect
          x="86"
          y="84"
          width="356"
          height="104"
          fill="none"
          stroke="rgba(116,227,211,0.50)"
          strokeWidth="1.15"
          strokeDasharray="4,4"
        />
      </svg>
    </div>
  );
}
