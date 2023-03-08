/** @format */
import { CacheMessage, Deserialization, Serialization } from "@/cache/HttpMessage";
export declare class SerializationMessageImpl extends Serialization {
    serialization(value: CacheMessage): string;
}
export declare class DeserializationMessageImpl extends Deserialization {
    deserialization(value: string): CacheMessage;
}
