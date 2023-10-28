export const numberToBytes = (number: number, length: number = 0): number[] => {
  if (number === 0) {
    return Array.from({ length: length === 0 ? 1 : length }, () => 0);
  }
  let numberLength = length;
  if (length === 0) {
    numberLength = Math.ceil(Math.log2(number) / 8) + 1;
  }

  const bytes = [];
  let i = 0;
  while (numberLength > 0) {
    bytes.unshift(number & 0xff);
    number = number >> 8;
    numberLength--;
  }

  return bytes;
};
