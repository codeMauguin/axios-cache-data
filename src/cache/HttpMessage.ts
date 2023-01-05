/** @format */

type CacheMessage = {
	readonly value: any;
	readonly expire: number;
};

abstract class Serialization {
	/**
	 *将对象序列化
	 * @param value
	 * @returns {string}
	 */
	abstract serialization(value: CacheMessage): string;

	public serializationKey(value: string): string {
		return value;
	}
}

abstract class Deserialization {
	abstract deserialization(value: string): CacheMessage;

	public deserializationKey(value: string): string {
		return value;
	}
}

export { Serialization, Deserialization, CacheMessage };
