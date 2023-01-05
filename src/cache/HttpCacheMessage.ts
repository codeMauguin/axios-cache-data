/** @format */

import { CacheMessage, Deserialization, Serialization } from "@/cache/HttpMessage";

export class SerializationMessageImpl extends Serialization {
	public serialization(value: CacheMessage): string {
		return JSON.stringify(value);
	}
}

export class DeserializationMessageImpl extends Deserialization {
	public deserialization(value: string): CacheMessage {
		return JSON.parse(value);
	}
}
