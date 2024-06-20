import { keys } from "@wvhulle/object";

import type { JSON } from "./json.js";

export * from "./group.js";
export * from "./hash.js";
export * from "./json.js";

export type Serializable =
	| JSON
	| { toArray: () => JSON[] }
	| { toJSON: () => JSON }
	| undefined
	| SerializableArray
	| SerializableObject;

export type SerializableArray = NonNullable<Serializable[]>;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type SerializableObject = {
	[k: string | number]: Serializable;
} & Record<symbol, never>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export function toJSON<Input extends Serializable>(object: Input): JSON {
	return recurse<Input>(object);
	// eslint-disable-next-line complexity
	function recurse<S extends Serializable>(intermediate_object: S): JSON {
		if (intermediate_object === null) {
			return null as JSON;
		} else if (intermediate_object === undefined) {
			return undefined as JSON;
		} else if (typeof intermediate_object === "object") {
			if (intermediate_object instanceof Array) {
				return intermediate_object.map((value: Serializable) =>
					recurse(value),
				) as JSON;
			} else if (
				"toArray" in intermediate_object &&
				typeof intermediate_object.toArray === "function"
			) {
				return intermediate_object
					.toArray()
					.map((value) => recurse(value)) as JSON;
			} else if (
				"toJSON" in intermediate_object &&
				typeof intermediate_object.toJSON === "function"
			) {
				return intermediate_object.toJSON();
			} else {
				return Object.fromEntries(
					keys(intermediate_object).map((key) => {
						const sub_object = (intermediate_object as NonNullable<S>)[key];
						if (typeof key === "symbol") {
							throw new Error(`Cannot toJSON a symbol.`);
						}
						return [key, recurse(sub_object as Serializable)];
					}),
				) as JSON;
			}
		} else if (
			typeof intermediate_object === "string" ||
			typeof intermediate_object === "number" ||
			typeof intermediate_object === "boolean"
		) {
			return intermediate_object as JSON;
		} else {
			throw new Error(`Object ${intermediate_object} cannot be serialized.`);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function isSerializable(data: unknown): data is Serializable {
	return recurse(data);
	// eslint-disable-next-line complexity
	function recurse(intermediate_data: unknown, stack: object[] = []): boolean {
		if (intermediate_data === null || intermediate_data === undefined) {
			return true;
		} else if (typeof intermediate_data === "object") {
			if (stack.includes(intermediate_data)) {
				return false;
			}
			stack.push(intermediate_data);
			if (intermediate_data instanceof Array) {
				if (intermediate_data.length === 0) {
					return true;
				} else {
					const first = intermediate_data[0] as unknown;

					return recurse(first, stack);
				}
			} else if (
				"toArray" in intermediate_data &&
				typeof intermediate_data.toArray === "function"
			) {
				return recurse(intermediate_data.toArray(), stack);
			} else if (
				"toJSON" in intermediate_data &&
				typeof intermediate_data.toJSON === "function"
			) {
				return true;
			} else {
				return (
					keys(intermediate_data as Record<PropertyKey, unknown>).reduce(
						(previousKeysAreSerializable: boolean, key: PropertyKey): boolean =>
							previousKeysAreSerializable && typeof key !== "symbol",
						true,
					) &&
					Object.values(
						intermediate_data as Record<PropertyKey, unknown>,
					).reduce(
						(prev: boolean, curr: unknown): boolean =>
							prev && recurse(curr, [...stack]),
						true,
					)
				);
			}
		} else if (
			typeof intermediate_data === "string" ||
			typeof intermediate_data === "number" ||
			typeof intermediate_data === "boolean"
		) {
			return true;
		} else {
			return false;
		}
	}
}
