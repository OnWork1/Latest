export const truncateString = (input: string, length: number): string => {
  if (input.length <= length) {
    return input;
  } else {
    return input.substring(0, length - 3) + '...';
  }
};
