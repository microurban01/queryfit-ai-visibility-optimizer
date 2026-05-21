import React, { useRef } from 'react';
import { useElementSize } from '../hooks/useElementSize';

interface ChartContainerProps {
  height?: number;
  className?: string;
  children: (size: { width: number; height: number }) => React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  height = 200,
  className = '',
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height: measuredHeight } = useElementSize(ref, height);
  const chartHeight = measuredHeight || height;

  return (
    <div
      ref={ref}
      className={`w-full min-w-0 ${className}`}
      style={{ height }}
    >
      {width > 0 ? children({ width, height: chartHeight }) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-full w-full rounded-xl bg-muted/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
