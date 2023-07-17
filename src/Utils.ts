import type { CamelKeysToSnakeCase, CamelToSnakeCase } from './models';

export const isNullish = (arg: any): arg is null | undefined =>
  arg === null || arg === undefined;

export const isObject = (arg: any): arg is object =>
  arg !== null && typeof arg === 'object';

export const isArray = (arg: any): arg is any[] => Array.isArray(arg);

export const camelToSnake = <S extends string>(str: S): CamelToSnakeCase<S> =>
  str.replace(
    /[A-Z]/g,
    (letter) => `_${letter.toLowerCase()}`
  ) as CamelToSnakeCase<S>;

export const camelKeysToSnake = <T extends object>(
  object: T
): CamelKeysToSnakeCase<T> => {
  if (isArray(object)) {
    return object.map((value: object) =>
      camelKeysToSnake(value)
    ) as CamelKeysToSnakeCase<T>;
  } else if (isObject(object)) {
    return Object.keys(object).reduce((newObject, key) => {
      const snakeKey = camelToSnake(key);
      //@ts-ignore FIXME
      newObject[snakeKey] = camelKeysToSnake(object[key]);
      return newObject;
    }, {}) as CamelKeysToSnakeCase<T>;
  }

  return object as CamelKeysToSnakeCase<T>;
};
