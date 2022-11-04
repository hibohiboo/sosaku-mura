import { defineSyncAttribute, defineSyncObject, defineSyncVariable } from './decorator-core';
import { ObjectNode } from './object-node';
import type { GameObject } from './game-object';
import type { Type } from './object-factory';


export function SyncObject(alias: string) {
  return <T extends GameObject>(constructor: Type<T>) => {
    console.log('defineSyncObject alias')
    console.log(alias)
    defineSyncObject(alias)(constructor);
  }
}

export function SyncVar() {
  return <T extends GameObject>(target: T, key: string | symbol) => {
    if (target instanceof ObjectNode) {
      console.log('defineSyncAttribute object node')
      console.log(key)
      defineSyncAttribute()(target, key);
    } else {
      console.log('defineSyncVariable var')
      console.log(key)

      defineSyncVariable()(target, key);
    }
  }
}
