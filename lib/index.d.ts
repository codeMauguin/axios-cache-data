import { AxiosInstance, AxiosResponse as AxiosResponse$1, CreateAxiosDefaults } from "axios";

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

type Method = "request" | "get" | "delete" | "head" | "options" | "post" | "put" | "patch" | "clear";

/** @format */

interface RequestOption {
	readonly hit?: boolean;
	readonly force?: boolean;
	readonly expire?: number;

	valid?(response: AxiosResponse$1): boolean;
}

interface CacheInstance {
	/**
	 * @default 1000*60*60
	 */
	readonly maxAge?: number;
	readonly key?: string;
	readonly storage?: Storage;
	readonly proxy?: Method[];
	readonly enableCache?: boolean | ((url: string, method: string) => boolean);
	/**
	 * 公共的key前缀 生成key需要获取到
	 */
	readonly prefix?: string;
	/**
	 * 消息转换
	 */
	readonly message?: {
		serialization: Serialization;
		deserialization: Deserialization;
	};

	valid?(response: AxiosResponse$1): boolean;

	generateKey?(
		key: string | undefined,
		url: string | undefined,
		method: unknown,
		header: unknown,
		params: string,
		data: string | object
	): string;
}

declare module "axios" {
	interface AxiosStatic {
		withCache(config: CreateAxiosDefaults, options: CacheInstance): AxiosInstance;
	}

	interface AxiosInstance {
		clear(): void;
	}

	interface AxiosRequestConfig {
		readonly hit?: boolean;
		readonly force?: boolean;
		readonly expire?: number;

		valid?(response: AxiosResponse): boolean;
	}
}

declare function http(config: CreateAxiosDefaults, options?: CacheInstance): AxiosInstance;

declare namespace http {
	var proxy: typeof proxy;
}

declare function proxy(instance: AxiosInstance, options?: CacheInstance): AxiosInstance;

export { CacheInstance, Method, RequestOption, http, proxy };
