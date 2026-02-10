interface DisplayProps {
  value: string;
  expression: string;
  isLoading: boolean;
  error: string | null;
}

function Display({ value, expression, isLoading, error }: DisplayProps) {
  const formatValue = (val: string): string => {
    if (val === 'Error' || val.startsWith('Error')) return val;

    const isNegative = val.startsWith('-');
    const absValue = isNegative ? val.slice(1) : val;

    const parts = absValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let result = formattedInteger;
    if (decimalPart !== undefined) {
      result += '.' + decimalPart;
    }

    return isNegative ? '-' + result : result;
  };

  return (
    <div className="display">
      <div className="display-expression">
        {expression}
      </div>

      <div
        key={isLoading ? 'computing' : 'value'}
        className={`display-value ${isLoading ? 'computing' : ''}`}
        style={{ animation: 'fadeInText 0.4s ease-out' }}
      >
        {isLoading ? 'Computing...' : formatValue(value)}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default Display;
