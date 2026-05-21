import { useEffect, useState, RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Measures a container so Recharts can use explicit width/height
 * (ResponsiveContainer often renders 0×0 inside flex/grid layouts).
 */
export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  defaultHeight = 200
): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: defaultHeight });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      const w = Math.floor(width);
      const h = Math.floor(height) || defaultHeight;
      if (w > 0) {
        setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, defaultHeight]);

  return size;
}
