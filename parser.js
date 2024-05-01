const expressionInput = document.getElementById('expression');
const calculateBtn = document.getElementById('calculate');
const resultElement = document.getElementById('result');

const tokenize = (expression) => {
  const tokens = [];
  let currentNumber = '';

  Array.prototype.reduce.call(expression, (acc, char) => {
    if (char === ' ') return acc;

    if (char >= '0' && char <= '9' || char === '.') {
      currentNumber += char;
      return acc;
    }

    if (currentNumber !== '') {
      acc.push({ type: 'number', value: parseFloat(currentNumber) });
      currentNumber = '';
    }

    acc.push({ type: 'operator', value: char });
    return acc;
  }, tokens);

  if (currentNumber !== '') {
    tokens.push({ type: 'number', value: parseFloat(currentNumber) });
  }
  return tokens;
};

const getPrecedence = (operator) => {
  switch (operator) {
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    default:
      return 0;
  }
};

const parse = (tokens) => {
  const outputQueue = [];
  const operatorStack = [];

  Array.prototype.reduce.call(tokens, (acc, token) => {
    if (token.type === 'number') {
      acc.push(token);
      return acc;
    }

    while (
      operatorStack.length > 0 &&
      operatorStack[operatorStack.length - 1].value !== '(' &&
      getPrecedence(token.value) <= getPrecedence(operatorStack[operatorStack.length - 1].value)
    ) {
      acc.push(operatorStack.pop());
    }
    operatorStack.push(token);
    return acc;
  }, outputQueue);

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }
  return outputQueue;
};

const evaluate = (outputQueue) => {
  const stack = [];

  Array.prototype.reduce.call(outputQueue, (acc, token) => {
    if (token.type === 'number') {
      acc.push(token.value);
      return acc;
    }

    const rightOperand = acc.pop();
    const leftOperand = acc.pop();
    switch (token.value) {
      case '+':
        acc.push(leftOperand + rightOperand);
        break;
      case '-':
        acc.push(leftOperand - rightOperand);
        break;
      case '*':
        acc.push(leftOperand * rightOperand);
        break;
      case '/':
        acc.push(leftOperand / rightOperand);
        break;
      default:
        throw new Error(`Bad input: ${token.value}`);
    }
    return acc;
  }, stack);

  return stack[0];
};

calculateBtn.addEventListener('click', () => {
  const expression = expressionInput.value;

  try {
    const tokens = tokenize(expression);
    const outputQueue = parse(tokens);
    const result = evaluate(outputQueue);
    resultElement.textContent = `Result: ${result}`;
  } catch (error) {
    resultElement.textContent = `Error: ${error.message}`;
  }
});