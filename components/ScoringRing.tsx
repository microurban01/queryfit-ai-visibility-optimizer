
import React from 'react';
import { Engine } from '../types';
import { ENGINE_METADATA } from '../constants';

interface ScoringRingProps {
  score: number;
  engineScores?: Partial<Record<Engine, number>>;
  activeEngines?: Engine[];
  size?: number;
  strokeWidth?: number;
  showSegments?: boolean;
  className?: string;
}

const ScoringRing: React.FC<ScoringRingProps> = ({
  score,
  engineScores,
  activeEngines,
  size = 200,
  strokeWidth = 14,
  showSegments = false,
  className = ""
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 2; 
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const engines = activeEngines || Object.values(Engine);
  const segmentAngle = 360 / engines.length;

  const numberFontSize = Math.max(14, size * 0.32);

  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Emerald
    if (val >= 60) return '#f59e0b'; // Amber
    if (val >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const ringColor = getScoreColor(score);

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        className="absolute rotate-[-90deg] overflow-visible"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
        />
        {score > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="scoring-ring-animate shadow-glow"
          />
        )}
      </svg>

      {showSegments && engineScores && (
        <svg 
          width={size} 
          height={size} 
          className="absolute rotate-[-90deg] overflow-visible"
        >
          {engines.map((engine, i) => {
            const engineScore = engineScores[engine] || 0;
            const startAngle = i * segmentAngle;
            const innerRadius = radius - (strokeWidth + 4);
            const innerCircumference = 2 * Math.PI * innerRadius;
            
            return (
              <circle
                key={engine}
                cx={center}
                cy={center}
                r={innerRadius}
                fill="transparent"
                stroke={ENGINE_METADATA[engine].color}
                strokeWidth={size * 0.015}
                strokeDasharray={`${(engineScore / 100) * (innerCircumference / engines.length)} ${innerCircumference}`}
                className="opacity-40"
                style={{
                  transform: `rotate(${startAngle}deg)`,
                  transformOrigin: 'center'
                }}
              />
            );
          })}
        </svg>
      )}

      <div className="flex flex-col items-center justify-center text-center select-none z-10">
        <div 
          className="font-black tracking-tighter text-foreground leading-none flex items-start" 
          style={{ fontSize: `${numberFontSize}px` }}
        >
          {Math.round(score)}
        </div>
      </div>
    </div>
  );
};

export default ScoringRing;
