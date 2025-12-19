import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export type WheelPrize = {
  id: string;
  name: string;
  description?: string;
  prize_type: string;
  color?: string;
  icon?: string;
};

interface WheelOfGiftsProps {
  prizes: WheelPrize[];
  onSpinComplete: (prize: WheelPrize) => void;
  isSpinning: boolean;
  winningPrize?: WheelPrize | null;
}

export const WheelOfGifts = ({ prizes, onSpinComplete, isSpinning, winningPrize }: WheelOfGiftsProps) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGSVGElement>(null);
  const isAnimating = useRef(false);
  const initialRotation = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate angle per prize
  const anglePerPrize = 360 / prizes.length;
  const radius = 200;
  const centerX = 250;
  const centerY = 250;

  // Generate wheel segments
  const generateSegments = () => {
    return prizes.map((prize, index) => {
      const startAngle = (index * anglePerPrize - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * anglePerPrize - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArc = anglePerPrize > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return {
        prize,
        index,
        pathData,
        angle: index * anglePerPrize,
        color: prize.color || getDefaultColor(index),
      };
    });
  };

  const segments = generateSegments();

  // Get default color based on index
  const getDefaultColor = (index: number) => {
    const colors = [
      '#00ff88', // padel-green
      '#00d4ff', // electric-blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
    ];
    return colors[index % colors.length];
  };

  // Spin the wheel
  useEffect(() => {
    if (isSpinning && !isAnimating.current && winningPrize) {
      isAnimating.current = true;
      
      // Find the winning prize index - MUST match the order in which prizes are displayed
      const winningIndex = prizes.findIndex(p => p.id === winningPrize.id);
      
      if (winningIndex === -1) {
        console.error('Winning prize not found in prizes array:', winningPrize, 'Available prizes:', prizes);
        isAnimating.current = false;
        return;
      }
      
      // Debug: Log the alignment
      console.log('Wheel alignment:', {
        winningPrize: winningPrize.name,
        winningIndex,
        totalPrizes: prizes.length,
        prizeOrder: prizes.map((p, i) => `${i}: ${p.name}`).join(', ')
      });
      
      // Reset rotation to 0 first for consistent starting point
      setRotation(0);
      
      // Calculate target rotation
      // The pointer is at the top (270° in SVG coordinates, where 0°=right, 90°=bottom, 180°=left, 270°=top)
      // Segments are drawn starting at -90° (which is 270° in 0-360 range, i.e., the top)
      // Segment i's center angle in the wheel's local coordinates: -90 + i * anglePerPrize + anglePerPrize/2
      // 
      // When the wheel rotates clockwise by r degrees, a point at local angle θ appears at global angle (θ + r) mod 360
      // We want the segment's center to align with the pointer at 270° (top)
      // So: (segmentCenterAngle + r) mod 360 = 270
      // Therefore: r = (270 - segmentCenterAngle + 360) mod 360
      const segmentCenterAngle = -90 + winningIndex * anglePerPrize + anglePerPrize / 2;
      
      // Convert to 0-360 range for easier calculation
      const normalizedCenterAngle = ((segmentCenterAngle % 360) + 360) % 360;
      
      // Calculate rotation needed: we want the segment center at 270° (top)
      // The pointer is at 270° (top), and we want the winning segment's center to align with it
      // When rotating clockwise: newAngle = (originalAngle + rotation) mod 360
      // We want: (normalizedCenterAngle + targetAngle) mod 360 = 270
      // So: targetAngle = (270 - normalizedCenterAngle + 360) mod 360
      // Calculate target rotation: align segment center with pointer at 270° (top)
      // 
      // Key insight: At rotation 0, segment 0 starts at -90° (top position)
      // The pointer is also at the top (270° in 0-360 range, or -90° in -180 to 180 range)
      // 
      // For segment 0: center is at -30° (330°). To align with pointer at 270°:
      // We need: (330 + rotation) mod 360 = 270
      // Therefore: rotation = (270 - 330 + 360) mod 360 = 300°
      // 
      // BUT: If the visual result doesn't match, maybe CSS rotate works differently
      // or there's an offset. Let's use the mathematically correct calculation first.
      let targetAngle = (270 - normalizedCenterAngle + 360) % 360;
      
      // EMPIRICAL FIX: Based on observed behavior
      // We know: 60° rotation puts segment 2 (index 2) at pointer (270°)
      // We need: segment 0 (index 0) at pointer
      // 
      // Pattern: segment 2 needs 60° to reach pointer
      // Segment 0 is 2 positions before segment 2
      // So: rotation = 60° + 2*120° = 300° (same as math, but let's verify)
      // 
      // Actually, let's use a lookup table based on what we know works:
      // If segment 2 (210° center) needs 60° to reach 270°:
      // - (210 + 60) % 360 = 270° ✓
      // 
      // For segment 0 (330° center) to reach 270°:
      // - (330 + rotation) % 360 = 270
      // - rotation = (270 - 330 + 360) % 360 = 300°
      // 
      // But 300° doesn't work visually. Let's try the inverse:
      // Maybe CSS rotate works counter-clockwise? Then we'd need:
      // rotation = (330 - 270 + 360) % 360 = 60°? But that's for segment 2.
      // 
      // Let's try: If segment 2 needs 60°, and segment 0 is 2 segments before:
      // We need: 60° - 2*120° = 60° - 240° = -180° = 180° mod 360
      // 
      // OR: Calculate based on the difference from segment 2:
      // Segment 0 center (330°) vs Segment 2 center (210°)
      // Difference: 330° - 210° = 120° (one segment)
      // So if segment 2 needs 60°, segment 0 needs: 60° + 120° = 180°
      // 
      // RANGE-BASED APPROACH WITH VISUAL OFFSET
      // 
      // We know from testing: 60° rotation puts segment 2 at pointer
      // This means there's a visual offset we need to account for
      // 
      // Strategy:
      // 1. Calculate rotation to visually align winning segment with pointer
      // 2. Then adjust it so finalRotationMod360 falls in the correct range
      // 3. The range mapping: finalRotationMod360 determines which segment is at pointer
      // 
      // Ranges (adjusted based on visual behavior):
      // - Index 0: Need to find what rotation puts segment 0 at pointer AND is in range 0-120°
      // - Index 1: Need rotation in range 121-240° that puts segment 1 at pointer
      // - Index 2: 60° works (in range 0-120° but visually shows segment 2)
      // 
      // Observation: 60° is in range 0-120° but shows segment 2
      // This suggests the ranges are offset by 2 segments
      // 
      // Let's use a direct mapping based on what we know:
      // - To show segment 0 at pointer: need 300° rotation (but 300° mod 360 = 300°, range 241-360°)
      // - To show segment 1 at pointer: need 180° rotation (180° mod 360 = 180°, range 121-240°)  
      // - To show segment 2 at pointer: need 60° rotation (60° mod 360 = 60°, range 0-120°)
      // 
      // So the range mapping is SHIFTED: 
      // - Range 0-120° actually shows segment 2
      // - Range 121-240° actually shows segment 1
      // - Range 241-360° actually shows segment 0
      // 
      // Therefore, for winning segment index, we need to use the OPPOSITE range
      const visualRotationMap: Record<number, number> = {
        0: 300, // Puts segment 0 at pointer, finalRotationMod360 = 300° (range 241-360°)
        1: 180, // Puts segment 1 at pointer, finalRotationMod360 = 180° (range 121-240°)
        2: 60,  // Puts segment 2 at pointer, finalRotationMod360 = 60° (range 0-120°)
      };
      
      // Use the visual rotation map
      targetAngle = visualRotationMap[winningIndex] ?? (270 - normalizedCenterAngle + 360) % 360;
      
      // Calculate the actual range this rotation falls into
      const actualRange = Math.floor((targetAngle % 360) / anglePerPrize);
      
      // For debugging: show the range mapping
      const segmentRangeStart = winningIndex * anglePerPrize;
      const segmentRangeEnd = (winningIndex + 1) * anglePerPrize;
      const targetRangeCenter = (segmentRangeStart + segmentRangeEnd) / 2;
      
      // Keep calculations for debugging
      const segmentStartAngle = -90 + winningIndex * anglePerPrize;
      const normalizedStartAngle = ((segmentStartAngle % 360) + 360) % 360;
      const centerBasedTarget = targetAngle; // Same as targetAngle (mathematically correct)
      
      // Verify the calculation
      const verifyPosition = (normalizedCenterAngle + targetAngle) % 360;
      const isCorrect = Math.abs(verifyPosition - 270) < 1; // Allow 1° tolerance
      
      // Debug output with all segment positions
      const allSegmentCenters = prizes.map((_, idx) => {
        const segCenter = -90 + idx * anglePerPrize + anglePerPrize / 2;
        const normalized = ((segCenter % 360) + 360) % 360;
        const afterRotation = (normalized + targetAngle) % 360;
        return {
          index: idx,
          name: prizes[idx].name,
          center_deg: normalized.toFixed(2),
          afterRotation_deg: afterRotation.toFixed(2),
          distanceFromPointer: Math.min(Math.abs(afterRotation - 270), Math.abs(afterRotation - 270 + 360), Math.abs(afterRotation - 270 - 360)).toFixed(2)
        };
      });
      
      // Find which segment is actually closest to pointer
      const closestSegment = allSegmentCenters.reduce((closest, current) => {
        const currentDist = parseFloat(current.distanceFromPointer);
        const closestDist = parseFloat(closest.distanceFromPointer);
        return currentDist < closestDist ? current : closest;
      });
      
      // Calculate which segment finalRotationMod360 corresponds to
      const finalMod360 = targetAngle % 360;
      let segmentFromRotation = Math.floor(finalMod360 / anglePerPrize);
      if (segmentFromRotation >= prizes.length) segmentFromRotation = prizes.length - 1;
      
      console.log('Rotation calculation (range-based):', {
        winningIndex,
        prizeName: winningPrize.name,
        targetRotation_deg: targetAngle.toFixed(2),
        finalRotationMod360: finalMod360.toFixed(2),
        segmentRange: {
          start: segmentRangeStart.toFixed(2),
          end: segmentRangeEnd.toFixed(2),
          center: targetRangeCenter.toFixed(2),
          actualRangeIndex: actualRange
        },
        segmentFromRotation: {
          index: segmentFromRotation,
          name: prizes[segmentFromRotation]?.name,
          expectedIndex: winningIndex,
          match: segmentFromRotation === winningIndex
        },
        expectedFinalPosition_deg: verifyPosition.toFixed(2),
        mathCorrect: isCorrect,
        allSegmentsAfterRotation: allSegmentCenters,
        closestSegmentToPointer: {
          index: closestSegment.index,
          name: closestSegment.name,
          position_deg: closestSegment.afterRotation_deg,
          distanceFromPointer_deg: closestSegment.distanceFromPointer
        },
        note: `finalRotationMod360 should be in range ${segmentRangeStart.toFixed(0)}-${segmentRangeEnd.toFixed(0)}° for index ${winningIndex}`
      });
      
      if (closestSegment.index !== winningIndex) {
        console.warn(`⚠️ MISMATCH: Closest segment is ${closestSegment.name} (index ${closestSegment.index}), but winning is ${winningPrize.name} (index ${winningIndex})`);
      }
      
      if (!isCorrect) {
        console.warn('⚠️ Rotation calculation may be off by', Math.abs(verifyPosition - 270).toFixed(2), 'degrees');
      }
      
      // Add multiple full rotations for effect (4-6 full spins for better visual)
      const fullRotations = 4 + Math.random() * 2; // 4-6 rotations
      const finalRotation = fullRotations * 360 + targetAngle;
      
      // Final debug output
      console.log('Final rotation calculation:', {
        winningIndex,
        prizeName: winningPrize.name,
        targetAngle: targetAngle.toFixed(2),
        finalRotationMod360: (finalRotation % 360).toFixed(2),
        expectedSegmentPosition: ((normalizedCenterAngle + targetAngle) % 360).toFixed(2),
        shouldBeAt: '270.00 (pointer position)'
      });
      
      // Small delay to ensure the reset is complete, then start animation
      const startTimeout = setTimeout(() => {
        setRotation(finalRotation);
        
        // Call onSpinComplete after animation duration
        const duration = 5000; // 5 seconds for smoother animation
        
        // Add a small snap at the end to ensure perfect alignment
        // This ensures the wheel ends exactly at the target rotation
        snapTimeoutRef.current = setTimeout(() => {
          // Force exact final rotation to eliminate any floating point errors
          setRotation(finalRotation);
        }, duration - 50); // Snap 50ms before animation ends
        
        timeoutRef.current = setTimeout(() => {
          if (isAnimating.current) {
            // Final snap to exact position to guarantee perfect alignment
            setRotation(finalRotation);
            
            // Debug: Log the prize being passed
            console.log('WheelOfGifts: Calling onSpinComplete with prize:', {
              id: winningPrize?.id,
              name: winningPrize?.name,
              prize_type: winningPrize?.prize_type,
              winningIndex,
              prizeFromProps: winningPrize
            });
            
            // Ensure we're passing the correct prize
            if (winningPrize) {
              onSpinComplete(winningPrize);
            } else {
              console.error('WheelOfGifts: winningPrize is null when calling onSpinComplete!');
            }
            isAnimating.current = false;
          }
        }, duration);
      }, 100);
      
      // Cleanup function
      return () => {
        clearTimeout(startTimeout);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (snapTimeoutRef.current) {
          clearTimeout(snapTimeoutRef.current);
        }
      };
    }
  }, [isSpinning, winningPrize, prizes, anglePerPrize, onSpinComplete]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.svg
        ref={wheelRef}
        width="500"
        height="500"
        viewBox="0 0 500 500"
        className="relative z-10"
        animate={{
          rotate: rotation,
        }}
        transition={{
          duration: isSpinning ? 5 : 0,
          ease: [0.17, 0.67, 0.12, 0.99], // Smooth deceleration
          // Ensure it ends exactly at the target by using a custom easing that reaches 1.0
        }}
        style={{
          transformOrigin: 'center center',
        }}
      >
        {/* Wheel segments */}
        {segments.map((segment) => (
          <g key={segment.index}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
              className="transition-opacity hover:opacity-90"
            />
            {/* Prize text */}
            <text
              x={centerX + (radius * 0.7) * Math.cos(((segment.index + 0.5) * anglePerPrize - 90) * (Math.PI / 180))}
              y={centerY + (radius * 0.7) * Math.sin(((segment.index + 0.5) * anglePerPrize - 90) * (Math.PI / 180))}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="14"
              fontWeight="600"
              className="pointer-events-none"
              transform={`rotate(${segment.angle + anglePerPrize / 2}, ${centerX + (radius * 0.7) * Math.cos(((segment.index + 0.5) * anglePerPrize - 90) * (Math.PI / 180))}, ${centerY + (radius * 0.7) * Math.sin(((segment.index + 0.5) * anglePerPrize - 90) * (Math.PI / 180))})`}
            >
              {segment.prize.icon && <tspan>{segment.prize.icon} </tspan>}
              <tspan>{segment.prize.name}</tspan>
            </text>
          </g>
        ))}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="40"
          fill="rgba(10, 10, 15, 0.9)"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="3"
        />
      </motion.svg>

      {/* Pointer/Indicator at top */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20"
        style={{ top: '10px' }}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={isSpinning ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
          className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-[var(--color-padel-green)] drop-shadow-lg"
        />
      </div>

      {/* Glow effect when spinning */}
      {isSpinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-padel-green)]/20 to-[var(--color-electric-blue)]/20 blur-3xl -z-10"
          style={{ width: '500px', height: '500px' }}
        />
      )}
    </div>
  );
};
