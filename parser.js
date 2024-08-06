// Get references to the HTML elements
const expressionInput = document.getElementById('expression');
const calculateBtn = document.getElementById('calculate');
const resultElement = document.getElementById('result');

// Function to tokenize the expression
const tokenize = (expression) => {
  const tokens = [];
  let numberBuffer = '';

  for (let char of expression) {
    if (/\d|\./.test(char)) {
      numberBuffer += char;
    } else {
      if (numberBuffer) {
        tokens.push({ type: 'number', value: parseFloat(numberBuffer) });
        numberBuffer = '';
      }
      if (/\S/.test(char)) {
        tokens.push({ type: 'operator', value: char });
      }
    }
  }

  if (numberBuffer) {
    tokens.push({ type: 'number', value: parseFloat(numberBuffer) });
  }

  return tokens;
};

// Function to get the precedence of an operator
const getPrecedence = (operator) => {
  switch (operator) {
    case '!':
      return 4;
    case '^':
      return 3;
    case '*':
    case '/':
      return 2;
    case '+':
    case '-':
      return 1;
    default:
      return 0;
  }
};

// Function to parse the tokens into an output queue (Shunting Yard Algorithm)
const parse = (tokens) => {
  const outputQueue = [];
  const operatorStack = [];

  tokens.forEach((token) => {
    if (token.type === 'number') {
      outputQueue.push(token);
    } else if (token.type === 'operator') {
      if (token.value === '(') {
        operatorStack.push(token);
      } else if (token.value === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.pop(); // Remove the '('
      } else {
        while (
          operatorStack.length > 0 &&
          getPrecedence(token.value) <= getPrecedence(operatorStack[operatorStack.length - 1].value)
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    }
  });

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  return outputQueue;
};

// Function to evaluate the output queue
const evaluate = (outputQueue) => {
  const stack = [];

  outputQueue.forEach((token) => {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'operator') {
      const rightOperand = stack.pop();
      const leftOperand = stack.pop();
      switch (token.value) {
        case '!':
          let result = 1;
          for (let i = 1; i <= rightOperand; i++) {
            result *= i;
          }
          stack.push(result);
          break;
        case '^':
          stack.push(Math.pow(leftOperand, rightOperand));
          break;
        case '*':
          stack.push(leftOperand * rightOperand);
          break;
        case '/':
          if (rightOperand === 0) {
            throw new Error('Division by zero');
          }
          stack.push(leftOperand / rightOperand);
          break;
        case '+':
          stack.push(leftOperand + rightOperand);
          break;
        case '-':
          stack.push(leftOperand - rightOperand);
          break;
        default:
          throw new Error(`Bad input: ${token.value}`);
      }
    }
  });

  return stack[0];
};

// Add a click event listener to the calculate button
calculateBtn.addEventListener('click', (event) => {
  event.preventDefault();

  const expression = expressionInput.value;

  // Check if the expression contains invalid characters
  if (/[^0-9.()+\-*/^! ]/.test(expression)) {
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
