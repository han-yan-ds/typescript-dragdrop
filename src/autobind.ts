export function AutoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value; // This is how I access the method ITSELF when decorating a method
  const adjustedDescriptor: PropertyDescriptor = { // cloning the descriptor EXCEPT now it's an accessor descriptor instead of a method... has get instead of value
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get() { // this is where the magic is: by calling the originalMethod, I'll actually call this getter INSTEAD, which gives me a Bound-Version of originalMethod instead
      return originalMethod.bind(this);
    }
  }
  return adjustedDescriptor;
}