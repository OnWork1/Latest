// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateInput(value: any, fieldName: string): true | string {
  return value ? true : `${fieldName} is required.`;
}
