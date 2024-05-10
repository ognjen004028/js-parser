// Get references to the HTML elements
const expressionInput = document.getElementById('expression');
const calculateBtn = document.getElementById('calculate');
const resultElement = document.getElementById('result');

// Function to tokenize the expression
const tokenize = (expression) => {
  const tokens = [];

  // Split the expression into characters and reduce them into tokens
  expression.split('').reduce((acc, char) => {
    if (char === '') return acc;

    // If the character is a number or a decimal point, add it to the current number token or create a new number token
    if (char >= '0' && char <= '9' || char === '.') {
      const lastIndex = acc.length - 1;
      if (lastIndex >= 0 && acc[lastIndex].type === 'number') {
        acc[lastIndex].value = `${acc[lastIndex].value}${char}`;
      } else {
        acc.push({ type: 'number', value: parseFloat(char) });
      }
    } else {
      // If the character is an operator, create a new operator token
      acc.push({ type: 'operator', value: char });
    }

    return acc;
  }, tokens);

  return tokens;
};

// Function to get the precedence of an operator
const getPrecedence = (operator) => {
  switch (operator) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    case '-':
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value === '-') {
        return 3;
      }
      return 1;
    default:
      return 0;
  }
};

// Function to parse the tokens into an output queue
const parse = (tokens) => {
  const outputQueue = [];
  const operatorStack = [];

  // Reduce the tokens into the output queue and operator stack
  tokens.reduce((acc, token) => {
    if (token.type === 'number') {
      acc.push(token);
      return acc;
    }

    // While there are operators in the operator stack with higher precedence, pop them into the output queue
    while (
      operatorStack.length > 0 &&
      (operatorStack[operatorStack.length - 1].value!== '(' &&
      getPrecedence(token.value) < getPrecedence(operatorStack[operatorStack.length - 1].value) ||
      token.value === '-' && operatorStack[operatorStack.length - 1].value === '-')
    ) {
      acc.push(operatorStack.pop());
    }
    operatorStack.push(token);
    return acc;
  }, outputQueue);

  // Pop all remaining operators from the operator stack into the output queue
  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }
  return outputQueue;
};

// Function to evaluate the output queue
const evaluate = (outputQueue) => {
  const stack = [];

  // Reduce the output queue into the final result
  outputQueue.reduce((acc, token) => {
    if (token.type === 'number') {
      acc.push(token.value);
      return acc;
    }

    // Pop the right and left operands from the stack and perform the operation
    const rightOperand = acc.pop();
    const leftOperand = acc.pop();
    switch (token.value) {
      case '+':
        acc.push(leftOperand + rightOperand);
        break;
      case '-':
        if (typeof leftOperand === 'number' && typeof rightOperand === 'number') {
          acc.push(leftOperand - rightOperand);
        } else {
          acc.push(-rightOperand);
        }
        break;
      case '*':
        acc.push(leftOperand * rightOperand);
        break;
      case '/':
        if (rightOperand === 0) {
          throw new Error('Division by zero');
        }
        acc.push(leftOperand / rightOperand);
        break;
      default:
        throw new Error(`Bad input: ${token.value}`);
    }
    return acc;
  }, stack);

  return stack[0];
};

// Add a click event listener to the calculate button
calculateBtn.addEventListener('click', (event) => {
  event.preventDefault();

  const expression = expressionInput.value;

  // Check if the expression contains invalid characters
  if (/[^0-9.()+\-*/ ]/.test(expression)) {
    resultElement.textContent = 'Error: Invalid input';
    return;
  }

  // Check if the expression is empty
  if (!expression || /^\s*$/.test(expression)) {
    resultElement.textContent = 'Error: Invalid input';
    return;
  }

  try {
    const tokens = tokenize(expression);
    const outputQueue = parse(tokens);
    const result = evaluate(outputQueue);
    resultElement.textContent = `Result: ${result}`;
  } catch (error) {
resultElement.textContent = `Error: ${error.message}`;
  }
});