import { JavaScriptPrimitive } from "@wvhulle/object";

import { sort } from "./hash.js";
import { Serializable, toJSON } from "./index.js";

export function groupBy<Record, GroupBy extends Serializable>(
	objects: Record[],
	fn: (o: Record) => GroupBy,
) {
	const map = new Map<JavaScriptPrimitive, { key: GroupBy; nodes: Record[] }>();
	for (const object of objects) {
		const hash = JSON.stringify(sort(toJSON(fn(object))));
		const group = map.get(hash)?.nodes;
		if (group) {
			group.push(object);
		} else {
			map.set(hash, { key: fn(object), nodes: [object] });
		}
	}
	return [...map.entries()].map(([_hash, { key, nodes }]) => ({ key, nodes }));
}
