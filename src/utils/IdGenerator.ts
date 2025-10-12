/**
 * Utility for generating unique IDs
 */

export class IdGenerator {
  private static counter = 0;

  public static generateTransitionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const counter = ++IdGenerator.counter;
    return `${timestamp}-${counter}-${random}`;
  }

  public static generateUniqueId(prefix = 'id'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  public static reset(): void {
    IdGenerator.counter = 0;
  }
}
