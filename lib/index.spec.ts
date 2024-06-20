import { isSerializable, toJSON } from "./index.js";

import fc from "fast-check";
import { assert, describe, it } from "vitest";

describe("encode", () => {
	it("should return null for nil values", () => {
		assert.equal(toJSON(null), null);
		assert.equal(toJSON(undefined), null);
	});

	it("should return an array of serialized values when given an array of serializable values", () => {
		fc.assert(
			fc.property(fc.array(fc.string()), (array) => {
				const encoded = toJSON(array);
				assert(encoded instanceof Array);
				assert.deepEqual(encoded, array.map(toJSON));
			}),
		);
	});

	it("should return a serialized object when given an object containing only serializable values", () => {
		fc.assert(
			fc.property(fc.dictionary(fc.string(), fc.float()), (obj) => {
				const encoded = toJSON(obj);
				assert.isObject(encoded);
				assert.deepEqual(
					encoded,
					Object.fromEntries(
						Object.entries(obj).map(([key, value]) => [key, toJSON(value)]),
					),
				);
			}),
		);
	});

	it("should throw an error if the object contains circular references", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const obj: Record<string, any> = {};
		obj.a = obj;
		assert.throws(() => toJSON(obj));
	});
});

describe("isSerializable", () => {
	it("should return true for nil values", () => {
		assert.isTrue(isSerializable(null));
		assert.isTrue(isSerializable(undefined));
	});

	// it('should return true for arrays containing only serializable values', () => {
	// 	fc.assert(
	// 		fc.property(fc.array(fc.anything()), (array) => {
	// 			assert.isTrue(isSerializable(array));
	// 		})
	// 	);
	// });

	it("should return true for objects containing only serializable values", () => {
		fc.assert(
			fc.property(fc.json(), (obj) => {
				assert.isTrue(isSerializable(obj));
			}),
		);
	});

	it("should return false for objects containing circular references", () => {
		const obj: Record<string, unknown> = {};
		obj.a = obj;
		assert.isFalse(isSerializable(obj));
	});
});
