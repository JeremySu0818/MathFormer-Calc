import { useState, useEffect } from 'react';

interface TitleBarProps { }

interface TrafficLightButtonProps {
  type: 'close' | 'minimize';
  isFocused: boolean;
  onClick: () => void;
  ariaLabel: string;
}

const TrafficLightButton = ({ type, isFocused, onClick, ariaLabel }: TrafficLightButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getColors = () => {
    if (!isFocused) return { outer: '#d1d0d2', inner: '#c7c7c7', icon: 'transparent' };

    if (type === 'close') {
      if (isPressed) return { outer: '#a14239', inner: '#b15048', icon: '#170101' };
      return { outer: '#e24b41', inner: '#ed6a5f', icon: '#460804' };
    } else {
      if (isPressed) return { outer: '#a67f36', inner: '#b8923b', icon: '#532a0a' };
      return { outer: '#e1a73e', inner: '#f6be50', icon: '#90591d' };
    }
  };

  const colors = getColors();

  return (
    <button
      className={`title-bar-btn ${type} ${isPressed ? 'pressed' : ''}`}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 85.4 85.4" xmlns="http://www.w3.org/2000/svg">
        <g clipRule="evenodd" fillRule="evenodd">
          <path d="m42.7 85.4c23.6 0 42.7-19.1 42.7-42.7s-19.1-42.7-42.7-42.7-42.7 19.1-42.7 42.7 19.1 42.7 42.7 42.7z" fill={colors.outer} />
          <path d="m42.7 81.8c21.6 0 39.1-17.5 39.1-39.1s-17.5-39.1-39.1-39.1-39.1 17.5-39.1 39.1 17.5 39.1 39.1 39.1z" fill={colors.inner} />
          <g
            fill={colors.icon}
            style={{
              opacity: isHovered && isFocused ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            {type === 'close' ? (
              <>
                <path d="m22.5 57.8 35.3-35.3c1.4-1.4 3.6-1.4 5 0l.1.1c1.4 1.4 1.4 3.6 0 5l-35.3 35.3c-1.4 1.4-3.6 1.4-5 0l-.1-.1c-1.3-1.4-1.3-3.6 0-5z" />
                <path d="m27.6 22.5 35.3 35.3c1.4 1.4 1.4 3.6 0 5l-.1.1c-1.4 1.4-3.6 1.4-5 0l-35.3-35.3c-1.4-1.4-1.4-3.6 0-5l.1-.1c1.4-1.3 3.6-1.3 5 0z" />
              </>
            ) : (
              <path d="m17.8 39.1h49.9c1.9 0 3.5 1.6 3.5 3.5v.1c0 1.9-1.6 3.5-3.5 3.5h-49.9c-1.9 0-3.5-1.6-3.5-3.5v-.1c0-1.9 1.5-3.5 3.5-3.5z" />
            )}
          </g>
        </g>
      </svg>
    </button>
  );
};

function TitleBar(_props: TitleBarProps) {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowMinimize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.windowClose();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-controls">
        <TrafficLightButton
          type="close"
          isFocused={isFocused}
          onClick={handleClose}
          ariaLabel="Close window"
        />
        <TrafficLightButton
          type="minimize"
          isFocused={isFocused}
          onClick={handleMinimize}
          ariaLabel="Minimize window"
        />
      </div>

      <div className="title-bar-title"></div>
    </div>
  );
}

export default TitleBar;

