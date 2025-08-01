import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className,
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    setCoords({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const baseClasses = [
    'absolute',
    'z-ep-tooltip',
    'px-2',
    'py-1',
    'text-sm',
    'text-white',
    'bg-ep-neutral-900',
    'rounded-md',
    'shadow-lg',
    'pointer-events-none',
    'transition-opacity',
    'duration-150',
    'max-w-xs',
    'break-words',
  ];

  const positionClasses = {
    top: ['bottom-full', 'left-1/2', '-translate-x-1/2', 'mb-2'],
    bottom: ['top-full', 'left-1/2', '-translate-x-1/2', 'mt-2'],
    left: ['right-full', 'top-1/2', '-translate-y-1/2', 'mr-2'],
    right: ['left-full', 'top-1/2', '-translate-y-1/2', 'ml-2'],
  };

  const classes = cn(
    baseClasses,
    positionClasses[position],
    isVisible ? 'opacity-100' : 'opacity-0',
    className
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <div
        ref={tooltipRef}
        className={classes}
        role="tooltip"
        aria-hidden={!isVisible}
        style={{
          left: `${coords.x}px`,
          top: `${coords.y}px`,
        }}
      >
        {content}
        <div
          className={cn(
            'absolute',
            'w-2',
            'h-2',
            'bg-ep-neutral-900',
            'transform',
            'rotate-45',
            position === 'top' && 'top-full left-1/2 -translate-x-1/2 -mt-1',
            position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
            position === 'left' && 'left-full top-1/2 -translate-y-1/2 -ml-1',
            position === 'right' && 'right-full top-1/2 -translate-y-1/2 -mr-1'
          )}
        />
      </div>
    </div>
  );
};

export default Tooltip; 