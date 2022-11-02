import { XmlUtil } from '../system/util/xml-util';
import type { Attributes } from './attributes';
import type { GameObject, ObjectContext } from './game-object';
import { ObjectFactory } from './object-factory';

export interface XmlAttributes extends GameObject {
  toAttributes(): Attributes;
  parseAttributes(attributes: NamedNodeMap): void;
}

export interface InnerXml extends GameObject {
  innerXml(): string;
  parseInnerXml(element: Element): void;
}

const objectPropertyKeys = Object.getOwnPropertyNames(Object.prototype);


export class ObjectSerializer {
  private static _instance: ObjectSerializer
  static get instance(): ObjectSerializer {
    if (!ObjectSerializer._instance) ObjectSerializer._instance = new ObjectSerializer();
    return ObjectSerializer._instance;
  }

  private constructor() {
    console.log('ObjectSerializer ready...');
  };

  toXml(gameObject: GameObject): string {
    let xml = '';
    const attributes = 'toAttributes' in gameObject ? (<XmlAttributes>gameObject).toAttributes() : ObjectSerializer.toAttributes(gameObject.toContext().syncData);
    const tagName = gameObject.aliasName;

    let attrStr = '';
    for (const name in attributes) {
      const attribute = XmlUtil.encodeEntityReference(attributes[name] + '');
      if (attribute == null) continue;
      attrStr += ' ' + name + '="' + attribute + '"';
    }
    xml += `<${tagName + attrStr}>`;
    xml += 'innerXml' in gameObject ? (<InnerXml>gameObject).innerXml() : '';
    xml += `</${tagName}>`;
    return xml;
  }

  static toAttributes(syncData: Record<string, any>): Attributes {
    const attributes: Record<string, any> = {};
    for (const syncVar in syncData) {
      const item = syncData[syncVar];
      const key = syncVar;
      const childAttr = ObjectSerializer.make2Attributes(item, key);
      for (const name in childAttr) {
        attributes[name] = childAttr[name];
      }
    }
    return attributes;
  }

  private static make2Attributes(item: any, key: string): Attributes {
    const attributes: Record<string, any> = {};
    if (Array.isArray(item)) {
      const arrayAttributes = ObjectSerializer.array2attributes(item, key);
      for (const name in arrayAttributes) {
        attributes[name] = arrayAttributes[name];
      }
    } else if (typeof item === 'object') {
      const objAttributes = ObjectSerializer.object2attributes(item, key);
      for (const name in objAttributes) {
        attributes[name] = objAttributes[name];
      }
    } else {
      attributes[key] = item;
    }
    return attributes;
  }

  private static object2attributes(obj: any, rootKey: string): Attributes {
    const attributes: Record<string, any> = {};
    for (const objKey in obj) {
      const item = obj[objKey];
      const key = rootKey + '.' + objKey;
      const childAttr = ObjectSerializer.make2Attributes(item, key);
      for (const name in childAttr) {
        attributes[name] = childAttr[name];
      }
    }
    return attributes;
  }

  private static array2attributes(array: Array<any>, rootKey: string): Attributes {
    const attributes: Record<string, any> = {};
    const length = array.length;
    for (let i = 0; i < length; i++) {
      const item = array[i];
      const key = rootKey + '.' + i;
      const childAttr = ObjectSerializer.make2Attributes(item, key);
      for (const name in childAttr) {
        attributes[name] = childAttr[name];
      }
    }
    return attributes;
  }

  parseXml(xml: string | Element): GameObject | null {
    let xmlElement: Element | null = null;
    if (typeof xml === 'string') {
      xmlElement = XmlUtil.xml2element(xml);
    } else {
      xmlElement = xml;
    }
    if (!xmlElement) {
      console.error('xmlElementが空です');
      return null;
    }

    const gameObject: GameObject | null = ObjectFactory.instance.create(xmlElement.tagName);
    if (!gameObject) return null;

    if ('parseAttributes' in gameObject) {
      (<XmlAttributes>gameObject).parseAttributes(xmlElement.attributes);
    } else {
      const context: ObjectContext = gameObject.toContext();
      ObjectSerializer.parseAttributes(context.syncData, xmlElement.attributes);
      gameObject.apply(context);
    }

    gameObject.initialize();
    if ('parseInnerXml' in gameObject) {
      (<InnerXml>gameObject).parseInnerXml(xmlElement);
    }
    return gameObject;
  }

  static parseAttributes(syncData: Object, attributes: NamedNodeMap): Object {
    const length = attributes.length;
    for (let i = 0; i < length; i++) {
      let value = attributes[i].value;
      value = XmlUtil.decodeEntityReference(value);

      const split: string[] = attributes[i].name.split('.');
      let key: string | number | null = split[0];
      let obj: any = syncData; // Object | Array<any>

      const pollutionKey = split.find(splitKey => objectPropertyKeys.includes(splitKey));
      if (pollutionKey != null) {
        console.log(`skip invalid key (${pollutionKey})`);
        continue;
      }

      if (1 < split.length) {
        ({ obj, key } = ObjectSerializer.attributes2object(split, obj, key));
        if (key == null) continue;
      }

      const type = typeof obj[key];
      if (type !== 'string' && obj[key] != null) {
        value = JSON.parse(value);
      }
      obj[key] = value;
    }
    return syncData;
  }

  private static attributes2object(split: string[], obj: any, key: string | number) { // obj: Object | any[],
    // 階層構造の解析 foo.bar.0="abc" 等
    // 処理として実装こそしているが、xmlの仕様としては良くないので使用するべきではない.
    let parentObj: any = null; // Object | Array<any> | null
    const length = split.length;
    for (let i = 0; i < length; i++) {
      const index = parseInt(split[i]);
      if (parentObj && !Number.isNaN(index) && !Array.isArray(obj) && Object.keys(parentObj).length) {
        parentObj[key] = [];
        obj = parentObj[key];
      }
      key = Number.isNaN(index) ? split[i] : index;

      if (Array.isArray(obj) && typeof key !== 'number') {
        console.warn('Arrayにはindexの挿入しか許可しない');
        return { obj, key: null };
      }
      if (i + 1 < length) {
        if (obj[key] == null)
          obj[key] = typeof key === 'number' ? [] : {};
        parentObj = obj;
        obj = obj[key];
      }
    }
    return { obj, key };
  }


}
