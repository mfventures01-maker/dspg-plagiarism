export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIConfigError';
    Object.setPrototypeOf(this, AIConfigError.prototype);
  }
}