type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = (...args: any[]) => T;

class DependenyInjectionCompositionRoot {
  private static instances: Map<
    string,
    { ClassOrFactory: Constructor | Factory; dependencies: string[] }
  > = new Map();

  static register<T>(
    name: string,
    ClassOrFactory: Constructor<T> | Factory<T>,
    dependencies: string[] = []
  ): void {
    this.instances.set(name, { ClassOrFactory, dependencies });
  }

  static resolve<T>(name: string): T {
    const entry = this.instances.get(name);
    if (!entry) {
      throw new Error(`No registration found for ${name}`);
    }

    const { ClassOrFactory, dependencies } = entry;
    const resolvedDependencies = dependencies.map((dep) =>
      this.resolve<any>(dep)
    );

    if (typeof ClassOrFactory === "function") {
      if (ClassOrFactory.prototype) {
        return new (ClassOrFactory as Constructor<T>)(...resolvedDependencies);
      } else {
        return (ClassOrFactory as Factory<T>)(...resolvedDependencies);
      }
    } else {
      throw new Error(`Invalid registration for ${name}`);
    }
  }
}

export default DependenyInjectionCompositionRoot;
