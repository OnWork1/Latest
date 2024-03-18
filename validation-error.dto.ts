export default interface ValidationError {
  path: (string | number)[];
  message: string;
}
