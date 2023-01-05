/** @format */
import type { AxiosAdapter, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic } from "axios";
import { Deserialization, Serialization }                                                   from "src/HttpMessage";
import { HttpCache }                                                                        from "./HttpCache";

export interface CacheInstance {
	/**
	 * @default 1000*60*60
	 */
	readonly maxAge?: number;
	readonly key?: string;
	readonly storage?: Storage;
	readonly enableCache?: boolean;
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
	
	generateKey?(key: string | undefined, url: string | undefined, method: unknown, params: string,
	             data: string): string;
}

declare module "axios" {
	interface AxiosStatic {
		withCache(instance: CacheInstance & AxiosRequestConfig): AxiosInstance;
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

export declare function createOptions(options?: CacheInstance): Omit<Required<CacheInstance>, "prefix"> & {
	cache: HttpCache;
};

export declare function cacheAdapter(defaultAdapter: AxiosAdapter, options: Omit<Required<CacheInstance>, "prefix"> & {
	cache: HttpCache;
}): AxiosAdapter;

export declare function createHttpCacheInstance(options: CacheInstance & AxiosRequestConfig): AxiosInstance;

declare const http: AxiosStatic;
export { http };
