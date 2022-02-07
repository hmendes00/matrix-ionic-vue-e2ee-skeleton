export function extension(ctr: any ) {
    let originalFunction: Function;
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
      originalFunction = descriptor.value;

      ctr.prototype[propertyKey] = function(...args){
        return originalFunction(this, ...args);
      }
    }
}