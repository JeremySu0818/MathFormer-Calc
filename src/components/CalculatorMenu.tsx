import { useState, useRef, useEffect } from 'react';

interface CalculatorMenuProps {
    mode: 'standard' | 'scientific';
    onModeChange: (mode: 'standard' | 'scientific') => void;
}

export default function CalculatorMenu({ mode, onModeChange }: CalculatorMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleModeSelect = (newMode: 'standard' | 'scientific') => {
        onModeChange(newMode);
        setIsOpen(false);
    };

    return (
        <div className="calculator-menu" ref={menuRef}>
            <button
                className={`calculator-menu-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
                title="Calculator Mode"
            >
                <div className="glass-content">
                    <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="menu-icon">
                        <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                        <line x1="20" y1="70" x2="80" y2="70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="calculator-menu-dropdown">
                    <div className="menu-header">Calculator Mode</div>
                    <button
                        className={`menu-item ${mode === 'standard' ? 'selected' : ''}`}
                        onClick={() => handleModeSelect('standard')}
                    >
                        <span className="menu-item-text">Standard</span>
                        {mode === 'standard' && <span className="menu-check">✓</span>}
                    </button>
                    <button
                        className={`menu-item ${mode === 'scientific' ? 'selected' : ''}`}
                        onClick={() => handleModeSelect('scientific')}
                    >
                        <span className="menu-item-text">Scientific</span>
                        {mode === 'scientific' && <span className="menu-check">✓</span>}
                    </button>
                </div>
            )}
        </div>
    );
}
