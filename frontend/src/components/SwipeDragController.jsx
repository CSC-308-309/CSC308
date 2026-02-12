/* eslint-disable no-undef */
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 20;
const EXIT_VELOCITY = 1000;
const ANIMATION_DURATION = 300;

const SwipeDragController = forwardRef(
  ({ children, onSwipe, isActive }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleDragStart = (clientX, clientY) => {
      if (!isActive) return;
      setIsDragging(true);
      setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (clientX, clientY) => {
      if (!isDragging) return;
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      if (Math.abs(dragOffset.x) > SWIPE_THRESHOLD) {
        const direction = dragOffset.x > 0 ? "right" : "left";
        executeSwipe(direction);
      } else {
        resetPosition();
      }
    };

    const executeSwipe = (direction) => {
      const exitX = direction === "right" ? EXIT_VELOCITY : -EXIT_VELOCITY;
      setDragOffset({ x: exitX, y: 0 });
      setTimeout(() => {
        onSwipe?.(direction);
        resetPosition();
      }, ANIMATION_DURATION);
    };

    const resetPosition = () => setDragOffset({ x: 0, y: 0 });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const programmaticSwipe = useCallback((direction) => {
      if (isDragging || !isActive) return;
      executeSwipe(direction);
    });

    // Add keyboard arrow key support
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (!isActive) return;
        if (e.key === "ArrowLeft") programmaticSwipe("left");
        if (e.key === "ArrowRight") programmaticSwipe("right");
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isActive, isDragging, programmaticSwipe]);

    // Expose swipe() to parent components
    useImperativeHandle(ref, () => ({
      swipe: programmaticSwipe,
    }));

    const rotation = isDragging ? dragOffset.x / ROTATION_FACTOR : 0;
    const opacity = isDragging
      ? Math.max(0.3, 1 - Math.abs(dragOffset.x) / 200)
      : 1;

    return (
      <div
        className="relative"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) =>
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleDragEnd}
      >
        {children({
          isDragging,
          dragOffset,
          rotation,
          opacity,
          swipe: programmaticSwipe,
        })}
      </div>
    );
  },
);

export default SwipeDragController;
