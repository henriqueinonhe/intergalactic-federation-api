export function isLuhnValid(code : string) : boolean {
  if(!/^\d{2,}$/.test(code)) {
    throw Error("Luhn codes must be composed solely of digits \
    and must have at least one digit not including the check digit!");
  }

  const digitList = code.split("").map(char => parseInt(char));
  const digitBeforeCheckDigitIndex = digitList.length - 2;
  for(let index = digitBeforeCheckDigitIndex; index >= 0; index -= 2) {
    const doubledDigit = digitList[index] * 2;
    const transformedDigit = doubledDigit > 9 ? doubledDigit - 9 : doubledDigit;
    digitList[index] = transformedDigit;
  }

  const checksum = digitList.reduce((accumulator, value) => accumulator + value, 0);
  return checksum % 10 === 0;
}

export function generateLuhnCheckDigit(partialCode : string) : string {
  const digitList = partialCode.split("").map(char => parseInt(char));
  for(let index = digitList.length - 1; index >= 0; index -= 2) {
    const doubledDigit = digitList[index] * 2;
    const transformedDigit = doubledDigit > 9 ? doubledDigit - 9 : doubledDigit;
    digitList[index] = transformedDigit;
  }

  const checksum = digitList.reduce((accumulator, value) => accumulator + value, 0);
  return (10 - checksum).toString();
}
