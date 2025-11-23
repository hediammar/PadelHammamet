import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface InfiniteSliderProps {
  children: ReactNode;
  gap?: number;
  reverse?: boolean;
  speed?: number;
  speedOnHover?: number;
}

export function InfiniteSlider({
  children,
  gap = 16,
  reverse = false,
  speed = 50,
  speedOnHover = 25,
}: InfiniteSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let offset = 0;
    const direction = reverse ? -1 : 1;

    const animate = () => {
      if (!isHoveredRef.current) {
        offset += direction * (speed / 60);
      } else {
        offset += direction * (speedOnHover / 60);
      }

      slider.style.transform = `translateX(${offset}px)`;

      const firstChild = slider.firstElementChild as HTMLElement;
      if (firstChild) {
        const width = firstChild.offsetWidth + gap;
        if (Math.abs(offset) >= width) {
          offset = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gap, reverse, speed, speedOnHover]);

  return (
    <div className="overflow-hidden">
      <div
        ref={sliderRef}
        className="flex w-max"
        style={{ gap: `${gap}px` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

