/** @format */
import { CacheMessage, Deserialization, Serialization } from "src/HttpMessage";

export declare class SerializationMessageImpl extends Serialization {
	serialization(value: CacheMessage): string;
}

export declare class DeserializationMessageImpl extends Deserialization {
	deserialization(value: string): CacheMessage;
}
