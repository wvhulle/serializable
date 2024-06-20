// import { logExecutionTime } from './function';

export type JSON =
	| undefined
	| boolean
	| number
	| string
	| null
	| JSONArray
	| JSONMap;

export interface JSONMap {
	[key: string | number]: JSON;
	[key: symbol]: never;
}

export type JSONArray = NonNullable<JSON[]>;

// export function decode<Pure>(
// 	json: JSON,
// 	cl: { fromJSON: (json: JSON) => Pure } | { fromJSON: (json: JSON) => Pure }
// ): Pure {
// 	if ('fromJSON' in cl) {
// 		return cl.fromJSON(json);
// 	} else if ('fromJSON' in cl) {
// 		return cl.fromJSON(json);
// 	} else {
// 		throw new Error(`No fromJSON or fromJSON methods in ${cl}`);
// 	}
// }

export function compute_bytes(object: unknown) {
	const object_list: unknown[] = [];
	const stack = [object];
	let number_of_bytes = 0;

	while (stack.length) {
		const value = stack.pop();

		if (typeof value === "boolean") {
			number_of_bytes += 4;
		} else if (typeof value === "string") {
			number_of_bytes += value.length * 2;
		} else if (typeof value === "number") {
			number_of_bytes += 8;
		} else if (typeof value === "object" && !object_list.includes(value)) {
			object_list.push(value);
			for (const i in value) {
				stack.push((value as Record<string, unknown>)[i]);
			}
		}
	}
	return number_of_bytes;
}
