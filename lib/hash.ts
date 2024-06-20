import { keys } from "@wvhulle/object";

import { type Serializable, toJSON } from "./index.js";
import type { JSON } from "./json.js";

export const isEqual = (a: Serializable, b: Serializable) =>
	JSON.stringify(sort(toJSON(a))) === JSON.stringify(sort(toJSON(b)));

export const sort = <Type extends JSON>(object: Type): Type => {
	if (typeof object === "object") {
		if (object instanceof Array) {
			return object.map(<A extends JSON>(i: A) =>
				typeof i == "object" && i !== null ? (sort(i) as A) : i,
			) as Type;
		} else if (object === null) {
			return null as Type;
		} else {
			const sortedKeys = keys(object).sort();
			const add = (acc: Partial<Type>, key: keyof Type) => {
				acc[key] = sort(object[key]) as Type[keyof Type];
				return acc;
			};

			const newObject: Type = sortedKeys.reduce(add, {}) as Type;
			return newObject;
		}
	} else {
		return object;
	}
};
