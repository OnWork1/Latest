import type { ValidationResult } from './validation-result.interface';

export interface ValidatorFunction {
  (): Promise<ValidationResult>;
}
