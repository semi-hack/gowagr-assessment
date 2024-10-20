import { ValueTransformer } from 'typeorm';

export class DecimalColumnToNumberTransformer implements ValueTransformer {
  to(value: string): string {
    return value;
  }

  from(value: string): number {
    return value ? parseFloat(value) : null;
  }
}
