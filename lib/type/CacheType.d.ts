/** @format */
import { Deserialization, Serialization } from "@/cache";
import { Method } from "@/type/Method";
import { AxiosResponse } from "axios";

interface RequestOption {
	readonly hit?: boolean;
	readonly force?: boolean;
	readonly expire?: number;

	valid?(response: AxiosResponse): boolean;
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

	valid?(response: AxiosResponse): boolean;

	generateKey?(
		key: string | undefined,
		url: string | undefined,
		method: unknown,
		header: unknown,
		params: string,
		data: string | object
	): string;
}

export type { CacheInstance, RequestOption };
