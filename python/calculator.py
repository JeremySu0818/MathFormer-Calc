import sys
import json
import mathformer

def calculate(operation: str, a: str, b: str) -> str:
    try:
        num_a = float(a) if '.' in a else int(a)
        num_b = float(b) if '.' in b else int(b)
        
        int_a = int(num_a)
        int_b = int(num_b)
        
        if operation == 'add':
            result = mathformer.add(int_a, int_b)
        elif operation == 'sub':
            result = mathformer.sub(int_a, int_b)
        elif operation == 'mul':
            result = mathformer.mul(int_a, int_b)
        elif operation == 'div':
            if int_b == 0:
                return "Error: Division by zero"
            result = mathformer.div(int_a, int_b)
        else:
            return f"Error: Unknown operation '{operation}'"
        
        return str(result)
        
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    if len(sys.argv) != 4:
        print("Usage: python calculator.py <operation> <a> <b>")
        print("Operations: add, sub, mul, div")
        sys.exit(1)
    
    operation = sys.argv[1]
    a = sys.argv[2]
    b = sys.argv[3]
    
    result = calculate(operation, a, b)
    print(result)

if __name__ == "__main__":
    main()
