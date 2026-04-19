// Lightweight DI container to support swap-able implementations per interface key.
export class Container {
  private readonly registry = new Map<string, unknown>();

  register<T>(token: string, instance: T): void {
    this.registry.set(token, instance);
  }

  resolve<T>(token: string): T {
    if (!this.registry.has(token)) {
      throw new Error(`No provider registered for token ${token}`);
    }
    return this.registry.get(token) as T;
  }
}

export const container = new Container();

