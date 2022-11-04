import type { GameObject } from './game-object';
import { ObjectFactory, type Type } from './object-factory';
import type { ObjectNode } from './object-node';

export function defineSyncObject(alias: string) {
  return <T extends GameObject>(constructor: Type<T>) => {
    ObjectFactory.instance.register(constructor, alias);
  }
}

export function defineSyncVariable() {
  return <T extends GameObject>(target: T, key: string | symbol) => {
    function getter(this: any) {
      console.log('defineSyncVariable getter', key)
      return this.context.syncData[key];
    }

    function setter(this: any, value: any) {
      console.log('defineSyncVariable setter', value)
      this.context.syncData[key] = value;
      this.update();
    }
    console.log('defineSyncVariable', key)
    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
    console.log('defineSyncVariable', target)
  }
}

export function defineSyncAttribute() {
  return <T extends ObjectNode>(target: T, key: string | symbol) => {
    function getter(this: any) {
      console.log('defineSyncAttribute getter', key)
      return this.getAttribute(key);
    }

    function setter(this: any, value: any) {
      console.log('setAttribute setter', value)
      this.setAttribute(key, value);
    }

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  }
}
