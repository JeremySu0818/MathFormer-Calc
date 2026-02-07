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
      {/* Liquid Glass Layers */}
      <div className="glass-filter"></div>
      <div className="glass-overlay"></div>
      <div className="glass-specular"></div>

      <span className="display-status">Neural Engine</span>

      <div className="display-expression">
        {expression}
      </div>

      <div className="display-value">
        {formatValue(value)}
      </div>

      {isLoading && (
        <div className="display-loading">
          <span className="display-loading-dot" />
          <span className="display-loading-dot" />
          <span className="display-loading-dot" />
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default Display;
