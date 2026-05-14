import GObject from '@girs/gobject-2.0';

// Taken from https://github.com/material-shell/material-shell/blob/main/src/utils/gjs.ts
/// Decorator function to call `GObject.registerClass` with the given class.
/// Use like
/// ```
/// @registerGObjectClass
/// export class MyThing extends GObject.Object { ... }
/// ```
export function registerGObjectClass<
  K,
  T extends { metaInfo?: GObject.MetaInfo<any, any, any>; new (...params: any[]): K }
>(target: T) {
  // Note that we use 'hasOwnProperty' because otherwise we would get inherited meta infos.
  // This would be bad because we would inherit the GObjectName too, which is supposed to be unique.
  if (Object.prototype.hasOwnProperty.call(target, 'metaInfo')) {
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    return GObject.registerClass<K, T>(target.metaInfo!, target) as typeof target;
  } else {
    // eslint-disable-next-line
    // @ts-ignore
    return GObject.registerClass<K, T>(target) as typeof target;
  }
}

export function registerGObjectClassWithMetaInfo<
  K,
  T extends { new (...params: any[]): K },
  P = Record<string, never>,
  S = Record<string, never>,
  I = never,
>(metaInfo: GObject.MetaInfo<P, S, I>, target: T) {
  // GIR typings do not model the overload well, so keep the workaround here.
  // @ts-ignore
  return GObject.registerClass<K, T>(metaInfo, target) as typeof target;
}
