import { useRef, useEffect, useState, useCallback, type ReactNode, type CSSProperties } from 'react';

type ScrollDirection = 'horizontal' | 'vertical' | 'both';

interface GlassScrollContainerProps {
    children: ReactNode;
    direction?: ScrollDirection;
    className?: string;
    style?: CSSProperties;
    autoScrollToEnd?: boolean;
}

function GlassScrollContainer({
    children,
    direction = 'horizontal',
    className = '',
    style,
    autoScrollToEnd = false,
}: GlassScrollContainerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const trackRefV = useRef<HTMLDivElement>(null);
    const thumbRefV = useRef<HTMLDivElement>(null);
    const trackRefH = useRef<HTMLDivElement>(null);
    const thumbRefH = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const [isOverflowingV, setIsOverflowingV] = useState(false);
    const [isOverflowingH, setIsOverflowingH] = useState(false);
    const [thumbSizeV, setThumbSizeV] = useState(0);
    const [thumbSizeH, setThumbSizeH] = useState(0);
    const [thumbPosV, setThumbPosV] = useState(0);
    const [thumbPosH, setThumbPosH] = useState(0);
    const [isDraggingV, setIsDraggingV] = useState(false);
    const [isDraggingH, setIsDraggingH] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
    const [scrollSize, setScrollSize] = useState({ width: 0, height: 0, clientWidth: 0, clientHeight: 0 });

    const dragStartRefV = useRef({ pointerPos: 0, scrollPos: 0 });
    const dragStartRefH = useRef({ pointerPos: 0, scrollPos: 0 });

    const showVertical = direction === 'vertical' || direction === 'both';
    const showHorizontal = direction === 'horizontal' || direction === 'both';

    const checkOverflow = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        if (showVertical) {
            setIsOverflowingV(el.scrollHeight > el.clientHeight + 1);
        }
        if (showHorizontal) {
            setIsOverflowingH(el.scrollWidth > el.clientWidth + 1);
        }
    }, [showVertical, showHorizontal]);

    const measureThumb = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        if (showVertical && trackRefV.current) {
            const track = trackRefV.current;
            const scrollTotal = el.scrollHeight;
            const clientTotal = el.clientHeight;
            const trackTotal = track.clientHeight;

            if (scrollTotal > clientTotal) {
                const ratio = clientTotal / scrollTotal;
                const newThumbSize = Math.max(ratio * trackTotal, 24);
                setThumbSizeV(newThumbSize);

                const scrollPos = el.scrollTop;
                const maxScroll = scrollTotal - clientTotal;
                const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
                const maxThumbPos = trackTotal - newThumbSize;
                setThumbPosV(scrollRatio * maxThumbPos);
            }
        }

        if (showHorizontal && trackRefH.current) {
            const track = trackRefH.current;
            const scrollTotal = el.scrollWidth;
            const clientTotal = el.clientWidth;
            const trackTotal = track.clientWidth;

            if (scrollTotal > clientTotal) {
                const ratio = clientTotal / scrollTotal;
                const newThumbSize = Math.max(ratio * trackTotal, 24);
                setThumbSizeH(newThumbSize);

                const scrollPos = el.scrollLeft;
                const maxScroll = scrollTotal - clientTotal;
                const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
                const maxThumbPos = trackTotal - newThumbSize;
                setThumbPosH(scrollRatio * maxThumbPos);
            }
        }

        setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
        setScrollSize({
            width: el.scrollWidth,
            height: el.scrollHeight,
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight
        });
    }, [showVertical, showHorizontal]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        checkOverflow();

        const resizeObs = new ResizeObserver(() => {
            checkOverflow();
            measureThumb();
        });
        resizeObs.observe(el);

        const mutObs = new MutationObserver(() => {
            checkOverflow();
            measureThumb();
        });
        mutObs.observe(el, { childList: true, subtree: true, characterData: true });

        return () => {
            resizeObs.disconnect();
            mutObs.disconnect();
        };
    }, [checkOverflow, measureThumb]);

    useEffect(() => {
        if (isOverflowingV || isOverflowingH) {
            requestAnimationFrame(() => measureThumb());
        }
    }, [isOverflowingV, isOverflowingH, measureThumb]);

    useEffect(() => {
        if (!autoScrollToEnd || !scrollRef.current) return;
        const el = scrollRef.current;

        const scrollToEndAndMeasure = () => {
            if (showVertical) el.scrollTop = el.scrollHeight;
            if (showHorizontal && direction === 'horizontal') {
                el.scrollLeft = el.scrollWidth;
            }
            checkOverflow();
            measureThumb();
        };

        scrollToEndAndMeasure();
        const timer = setTimeout(scrollToEndAndMeasure, 50);
        return () => clearTimeout(timer);
    }, [children, autoScrollToEnd, showVertical, showHorizontal, checkOverflow, measureThumb]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                measureThumb();
            });
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            el.removeEventListener('scroll', handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [measureThumb]);

    const handleThumbPointerDownV = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = scrollRef.current;
        if (!el) return;
        setIsDraggingV(true);
        dragStartRefV.current = { pointerPos: e.clientY, scrollPos: el.scrollTop };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleThumbPointerMoveV = (e: React.PointerEvent) => {
        if (!isDraggingV) return;
        const el = scrollRef.current;
        const track = trackRefV.current;
        if (!el || !track) return;

        const pointerDelta = e.clientY - dragStartRefV.current.pointerPos;
        const trackTotal = track.clientHeight;
        const maxThumbTravel = trackTotal - thumbSizeV;
        const maxScroll = el.scrollHeight - el.clientHeight;
        const scrollDelta = maxThumbTravel > 0 ? (pointerDelta / maxThumbTravel) * maxScroll : 0;
        el.scrollTop = dragStartRefV.current.scrollPos + scrollDelta;
    };

    const handleThumbPointerDownH = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = scrollRef.current;
        if (!el) return;
        setIsDraggingH(true);
        dragStartRefH.current = { pointerPos: e.clientX, scrollPos: el.scrollLeft };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handleThumbPointerMoveH = (e: React.PointerEvent) => {
        if (!isDraggingH) return;
        const el = scrollRef.current;
        const track = trackRefH.current;
        if (!el || !track) return;

        const pointerDelta = e.clientX - dragStartRefH.current.pointerPos;
        const trackTotal = track.clientWidth;
        const maxThumbTravel = trackTotal - thumbSizeH;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const scrollDelta = maxThumbTravel > 0 ? (pointerDelta / maxThumbTravel) * maxScroll : 0;
        el.scrollLeft = dragStartRefH.current.scrollPos + scrollDelta;
    };

    const visibleV = isOverflowingV && (isHovering || isDraggingV);
    const visibleH = isOverflowingH && (isHovering || isDraggingH);

    const scrollAreaStyle: CSSProperties = {
        overflowX: showHorizontal ? 'auto' : 'hidden',
        overflowY: showVertical ? 'auto' : 'hidden',
        scrollbarWidth: 'none' as const,
        width: '100%',
        height: '100%',
    };

    const getMaskStyle = (): CSSProperties => {
        if (direction === 'horizontal') {
            if (!isOverflowingH) return {};

            const isAtStart = scrollPos.left <= 2;
            const isAtEnd = scrollPos.left + scrollSize.clientWidth >= scrollSize.width - 2;

            if (isAtStart && isAtEnd) return {};
            let mask = '';
            const fadeSize = '40px';

            if (!isAtStart && !isAtEnd) {
                mask = `linear-gradient(to right, transparent, black ${fadeSize}, black calc(100% - ${fadeSize}), transparent)`;
            } else if (!isAtStart) {
                mask = `linear-gradient(to right, transparent, black ${fadeSize})`;
            } else if (!isAtEnd) {
                mask = `linear-gradient(to right, black calc(100% - ${fadeSize}), transparent)`;
            }

            return {
                WebkitMaskImage: mask,
                maskImage: mask,
            };
        }

        if (direction === 'vertical') {
            if (!isOverflowingV) return {};

            const isAtStart = scrollPos.top <= 2;
            const isAtEnd = scrollPos.top + scrollSize.clientHeight >= scrollSize.height - 2;

            if (isAtStart && isAtEnd) return {};

            let mask = '';
            const fadeSize = '20px';

            if (!isAtStart && !isAtEnd) {
                mask = `linear-gradient(to bottom, transparent, black ${fadeSize}, black calc(100% - ${fadeSize}), transparent)`;
            } else if (!isAtStart) {
                mask = `linear-gradient(to bottom, transparent, black ${fadeSize})`;
            } else if (!isAtEnd) {
                mask = `linear-gradient(to bottom, black calc(100% - ${fadeSize}), transparent)`;
            }

            return {
                WebkitMaskImage: mask,
                maskImage: mask,
            };
        }

        return {};
    };

    const combinedScrollAreaStyle: CSSProperties = {
        ...scrollAreaStyle,
        ...getMaskStyle(),
    };

    return (
        <div
            className={`glass-scroll-container ${className}`}
            style={{ position: 'relative', ...style }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div ref={scrollRef} className="glass-scroll-area" style={combinedScrollAreaStyle}>
                {children}
            </div>

            {showVertical && (
                <div
                    ref={trackRefV}
                    className="glass-scroll-track vertical"
                    style={{
                        position: 'absolute', right: 2, top: 4, bottom: showHorizontal && isOverflowingH ? 12 : 4,
                        width: 6, borderRadius: 3, zIndex: 10, cursor: 'pointer',
                        opacity: visibleV ? 1 : 0, transition: 'opacity 0.3s ease',
                        pointerEvents: visibleV ? 'auto' : 'none'
                    }}
                >
                    <div className="glass-scroll-track-bg" />
                    <div
                        ref={thumbRefV}
                        className="glass-scroll-thumb"
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: thumbSizeV,
                            borderRadius: 3, transform: `translateY(${thumbPosV}px)`,
                            transition: isDraggingV ? 'none' : 'transform 0.08s ease-out', cursor: 'grab'
                        }}
                        onPointerDown={handleThumbPointerDownV}
                        onPointerMove={handleThumbPointerMoveV}
                        onPointerUp={() => setIsDraggingV(false)}
                        onPointerCancel={() => setIsDraggingV(false)}
                    >
                        <div className="glass-scroll-thumb-inner" />
                    </div>
                </div>
            )}

            {showHorizontal && (
                <div
                    ref={trackRefH}
                    className="glass-scroll-track horizontal"
                    style={{
                        position: 'absolute', bottom: 2, left: 4, right: showVertical && isOverflowingV ? 12 : 4,
                        height: 6, borderRadius: 3, zIndex: 10, cursor: 'pointer',
                        opacity: visibleH ? 1 : 0, transition: 'opacity 0.3s ease',
                        pointerEvents: visibleH ? 'auto' : 'none'
                    }}
                >
                    <div className="glass-scroll-track-bg" />
                    <div
                        ref={thumbRefH}
                        className="glass-scroll-thumb"
                        style={{
                            position: 'absolute', top: 0, left: 0, height: '100%', width: thumbSizeH,
                            borderRadius: 3, transform: `translateX(${thumbPosH}px)`,
                            transition: isDraggingH ? 'none' : 'transform 0.08s ease-out', cursor: 'grab'
                        }}
                        onPointerDown={handleThumbPointerDownH}
                        onPointerMove={handleThumbPointerMoveH}
                        onPointerUp={() => setIsDraggingH(false)}
                        onPointerCancel={() => setIsDraggingH(false)}
                    >
                        <div className="glass-scroll-thumb-inner" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default GlassScrollContainer;
