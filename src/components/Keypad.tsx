import { useCallback, MouseEvent } from 'react';

type Operation = 'add' | 'sub' | 'mul' | 'div' | null;

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperation: (op: Operation) => void;
  onEquals: () => void;
  onClear: () => void;
  onClearEntry: () => void;
  onToggleSign: () => void;
  onBackspace: () => void;
  activeOperation: Operation;
  isLoading: boolean;
}

interface ButtonConfig {
  label: string;
  type: 'number' | 'operator' | 'function' | 'equals';
  action: () => void;
  areaClass: string;
  operation?: Operation;
}

function Keypad({
  onDigit,
  onDecimal,
  onOperation,
  onEquals,
  onClear,
  onClearEntry,
  onToggleSign,
  activeOperation,
  isLoading,
}: KeypadProps) {

  const createRipple = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }, []);

  const allButtons: ButtonConfig[] = [
    { label: 'C', type: 'function', action: onClear, areaClass: 'btn-area-c' },
    { label: 'CE', type: 'function', action: onClearEntry, areaClass: 'btn-area-ce' },
    { label: '±', type: 'function', action: onToggleSign, areaClass: 'btn-area-sign' },
    { label: '÷', type: 'operator', action: () => onOperation('div'), operation: 'div', areaClass: 'btn-area-div' },
    { label: '7', type: 'number', action: () => onDigit('7'), areaClass: 'btn-area-n7' },
    { label: '8', type: 'number', action: () => onDigit('8'), areaClass: 'btn-area-n8' },
    { label: '9', type: 'number', action: () => onDigit('9'), areaClass: 'btn-area-n9' },
    { label: '×', type: 'operator', action: () => onOperation('mul'), operation: 'mul', areaClass: 'btn-area-mul' },
    { label: '4', type: 'number', action: () => onDigit('4'), areaClass: 'btn-area-n4' },
    { label: '5', type: 'number', action: () => onDigit('5'), areaClass: 'btn-area-n5' },
    { label: '6', type: 'number', action: () => onDigit('6'), areaClass: 'btn-area-n6' },
    { label: '-', type: 'operator', action: () => onOperation('sub'), operation: 'sub', areaClass: 'btn-area-sub' },
    { label: '1', type: 'number', action: () => onDigit('1'), areaClass: 'btn-area-n1' },
    { label: '2', type: 'number', action: () => onDigit('2'), areaClass: 'btn-area-n2' },
    { label: '3', type: 'number', action: () => onDigit('3'), areaClass: 'btn-area-n3' },
    { label: '+', type: 'operator', action: () => onOperation('add'), operation: 'add', areaClass: 'btn-area-add' },
    { label: '0', type: 'number', action: () => onDigit('0'), areaClass: 'btn-area-n0' },
    { label: '.', type: 'number', action: onDecimal, areaClass: 'btn-area-dot' },
    { label: '=', type: 'equals', action: onEquals, areaClass: 'btn-area-eq' },
  ];

  const renderButton = (config: ButtonConfig, index: number) => {
    const isActive = config.operation && config.operation === activeOperation;

    const classNames = [
      'btn',
      config.areaClass,
      config.type === 'number' ? 'btn-number' : '',
      config.type === 'operator' ? 'btn-operator' : '',
      config.type === 'function' ? 'btn-function' : '',
      config.type === 'equals' ? 'btn-equals' : '',
      isActive ? 'active' : '',
    ].filter(Boolean).join(' ');

    return (
      <button
        key={index}
        className={classNames}
        onClick={(e) => {
          createRipple(e);
          config.action();
        }}
        disabled={isLoading && config.type !== 'function'}
        aria-label={config.label}
      >
        <span className="glass-content">{config.label}</span>
      </button>
    );
  };

  return (
    <div className="keypad">
      {allButtons.map((btn, index) => renderButton(btn, index))}
    </div>
  );
}

export default Keypad;
