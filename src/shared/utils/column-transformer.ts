import { ValueTransformer } from 'typeorm';

export class DecimalColumnToNumberTransformer implements ValueTransformer {
  /**
   * Converts a string to a string
   * @param {string} value - The string value
   * @returns {string} The string value
   */
  to(value: string): string {
    return value;
  }

  /**
   * Converts a string to a number
   * @param {string} value - The string value
   * @returns {number} The number value
   */
  from(value: string): number {
    return value ? parseFloat(value) : null;
  }
}
