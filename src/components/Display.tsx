import GlassScrollContainer from './GlassScrollContainer';

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

    const displayText = isLoading ? 'Computing...' : formatValue(value);

    return (
        <div className="display">
            <div className="display-expression">
                {expression}
            </div>

            <GlassScrollContainer
                direction="horizontal"
                autoScrollToEnd
                className="display-value-scroll"
                style={{ width: '100%', height: 50 }}
            >
                <div
                    key={isLoading ? 'computing' : 'value'}
                    className={`display-value ${isLoading ? 'computing' : ''}`}
                    style={{ animation: 'fadeInText 0.4s ease-out' }}
                >
                    {displayText}
                </div>
            </GlassScrollContainer>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Display;
