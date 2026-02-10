import { useRef, useEffect, useState, useCallback, type ReactNode, type CSSProperties } from 'react';

type ScrollDirection = 'horizontal' | 'vertical';

interface GlassScrollContainerProps {
    children: ReactNode;
    direction?: ScrollDirection;
    className?: string;
    style?: CSSProperties;
    /** Auto-scroll to end when content changes */
    autoScrollToEnd?: boolean;
}

/**
 * A reusable liquid-glass scrollbar container with refraction effect.
 * Supports both horizontal and vertical directions.
 * The scrollbar only appears when content overflows.
 */
function GlassScrollContainer({
    children,
    direction = 'horizontal',
    className = '',
    style,
    autoScrollToEnd = false,
}: GlassScrollContainerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const [isOverflowing, setIsOverflowing] = useState(false);
    const [thumbSize, setThumbSize] = useState(0);
    const [thumbPos, setThumbPos] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const dragStartRef = useRef({ pointerPos: 0, scrollPos: 0 });

    const isHorizontal = direction === 'horizontal';

    const checkOverflow = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const scrollTotal = isHorizontal ? el.scrollWidth : el.scrollHeight;
        const clientTotal = isHorizontal ? el.clientWidth : el.clientHeight;
        const overflows = scrollTotal > clientTotal + 1;
        setIsOverflowing(overflows);
    }, [isHorizontal]);

    const measureThumb = useCallback(() => {
        const el = scrollRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const scrollTotal = isHorizontal ? el.scrollWidth : el.scrollHeight;
        const clientTotal = isHorizontal ? el.clientWidth : el.clientHeight;
        const trackTotal = isHorizontal ? track.clientWidth : track.clientHeight;

        if (scrollTotal <= clientTotal) return;

        const ratio = clientTotal / scrollTotal;
        const newThumbSize = Math.max(ratio * trackTotal, 24);
        setThumbSize(newThumbSize);

        const scrollPos = isHorizontal ? el.scrollLeft : el.scrollTop;
        const maxScroll = scrollTotal - clientTotal;
        const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
        const maxThumbPos = trackTotal - newThumbSize;
        setThumbPos(scrollRatio * maxThumbPos);
    }, [isHorizontal]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        checkOverflow();

        const resizeObs = new ResizeObserver(() => checkOverflow());
        resizeObs.observe(el);

        const mutObs = new MutationObserver(() => checkOverflow());
        mutObs.observe(el, { childList: true, subtree: true, characterData: true });

        return () => {
            resizeObs.disconnect();
            mutObs.disconnect();
        };
    }, [checkOverflow]);

    useEffect(() => {
        if (isOverflowing) {
            requestAnimationFrame(() => measureThumb());
        }
    }, [isOverflowing, measureThumb]);

    useEffect(() => {
        if (!autoScrollToEnd || !scrollRef.current) return;
        const el = scrollRef.current;
        if (isHorizontal) {
            el.scrollLeft = el.scrollWidth;
        } else {
            el.scrollTop = el.scrollHeight;
        }
        requestAnimationFrame(() => {
            checkOverflow();
            measureThumb();
        });
    }, [children, autoScrollToEnd, isHorizontal, checkOverflow, measureThumb]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const track = trackRef.current;
                if (!track) return;

                const scrollTotal = isHorizontal ? el.scrollWidth : el.scrollHeight;
                const clientTotal = isHorizontal ? el.clientWidth : el.clientHeight;
                const trackTotal = isHorizontal ? track.clientWidth : track.clientHeight;
                const maxScroll = scrollTotal - clientTotal;
                const scrollPos = isHorizontal ? el.scrollLeft : el.scrollTop;
                const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
                const maxThumbPos = trackTotal - thumbSize;
                setThumbPos(scrollRatio * maxThumbPos);
            });
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            el.removeEventListener('scroll', handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isHorizontal, thumbSize]);

    const handleThumbPointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = scrollRef.current;
        if (!el) return;

        setIsDragging(true);
        dragStartRef.current = {
            pointerPos: isHorizontal ? e.clientX : e.clientY,
            scrollPos: isHorizontal ? el.scrollLeft : el.scrollTop,
        };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [isHorizontal]);

    const handleThumbPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;
        const el = scrollRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const pointerDelta = (isHorizontal ? e.clientX : e.clientY) - dragStartRef.current.pointerPos;
        const trackTotal = isHorizontal ? track.clientWidth : track.clientHeight;
        const scrollTotal = isHorizontal ? el.scrollWidth : el.scrollHeight;
        const clientTotal = isHorizontal ? el.clientWidth : el.clientHeight;

        const maxThumbTravel = trackTotal - thumbSize;
        const maxScroll = scrollTotal - clientTotal;
        const scrollDelta = maxThumbTravel > 0 ? (pointerDelta / maxThumbTravel) * maxScroll : 0;

        if (isHorizontal) {
            el.scrollLeft = dragStartRef.current.scrollPos + scrollDelta;
        } else {
            el.scrollTop = dragStartRef.current.scrollPos + scrollDelta;
        }
    }, [isDragging, isHorizontal, thumbSize]);

    const handleThumbPointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTrackClick = useCallback((e: React.MouseEvent) => {
        const el = scrollRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        if (thumbRef.current && thumbRef.current.contains(e.target as Node)) return;

        const trackRect = track.getBoundingClientRect();
        const clickPos = isHorizontal
            ? e.clientX - trackRect.left
            : e.clientY - trackRect.top;
        const trackTotal = isHorizontal ? track.clientWidth : track.clientHeight;
        const scrollTotal = isHorizontal ? el.scrollWidth : el.scrollHeight;
        const clientTotal = isHorizontal ? el.clientWidth : el.clientHeight;

        const ratio = clickPos / trackTotal;
        const maxScroll = scrollTotal - clientTotal;

        el.scrollTo({
            [isHorizontal ? 'left' : 'top']: ratio * maxScroll,
            behavior: 'smooth',
        });
    }, [isHorizontal]);

    const visible = isOverflowing && (isHovering || isDragging);

    const containerStyle: CSSProperties = {
        position: 'relative',
        ...style,
    };

    const scrollAreaStyle: CSSProperties = {
        overflowX: isHorizontal ? 'scroll' : 'hidden',
        overflowY: isHorizontal ? 'hidden' : 'scroll',
        scrollbarWidth: 'none' as const,
        width: '100%',
        height: '100%',
    };

    const trackStyle: CSSProperties = isHorizontal
        ? {
            position: 'absolute',
            bottom: 2,
            left: 8,
            right: 8,
            height: 6,
            borderRadius: 3,
            zIndex: 10,
            cursor: 'pointer',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: visible ? 'auto' : 'none',
        }
        : {
            position: 'absolute',
            right: 2,
            top: 8,
            bottom: 8,
            width: 6,
            borderRadius: 3,
            zIndex: 10,
            cursor: 'pointer',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: visible ? 'auto' : 'none',
        };

    const thumbStyle: CSSProperties = isHorizontal
        ? {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: thumbSize,
            borderRadius: 3,
            transform: `translateX(${thumbPos}px)`,
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            cursor: 'grab',
        }
        : {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: thumbSize,
            borderRadius: 3,
            transform: `translateY(${thumbPos}px)`,
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            cursor: 'grab',
        };

    return (
        <div
            className={`glass-scroll-container ${className}`}
            style={containerStyle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Scrollable area (native scrollbar hidden via CSS) */}
            <div
                ref={scrollRef}
                className="glass-scroll-area"
                style={scrollAreaStyle}
            >
                {children}
            </div>

            {/* Custom glass scrollbar track — always rendered but hidden via opacity */}
            <div
                ref={trackRef}
                className="glass-scroll-track"
                style={trackStyle}
                onClick={handleTrackClick}
            >
                {/* Glass track background */}
                <div className="glass-scroll-track-bg" />

                {/* Glass thumb */}
                <div
                    ref={thumbRef}
                    className="glass-scroll-thumb"
                    style={thumbStyle}
                    onPointerDown={handleThumbPointerDown}
                    onPointerMove={handleThumbPointerMove}
                    onPointerUp={handleThumbPointerUp}
                    onPointerCancel={handleThumbPointerUp}
                >
                    <div className="glass-scroll-thumb-inner" />
                </div>
            </div>
        </div>
    );
}

export default GlassScrollContainer;
