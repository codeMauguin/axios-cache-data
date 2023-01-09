/** @format */
type CacheMessage = {
	readonly value: any;
	readonly expire: number;
};

declare abstract class Serialization {
	/**
	 *将对象序列化
	 * @param value
	 * @returns {string}
	 */
	abstract serialization(value: CacheMessage): string;

	serializationKey(value: string): string;
}

declare abstract class Deserialization {
	abstract deserialization(value: string): CacheMessage;

	deserializationKey(value: string): string;
}

export { Serialization, Deserialization, CacheMessage };
