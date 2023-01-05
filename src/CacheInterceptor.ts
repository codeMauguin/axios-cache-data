/** @format */

import type { AxiosAdapter, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse, AxiosStatic } from "axios";
import axios                                                                                              from "axios";
import {
	DeserializationMessageImpl, SerializationMessageImpl
}                                                                                                         from "src/HttpCacheMessage";
import {
	Deserialization, Serialization
}                                                                                                         from "src/HttpMessage";
import {
	HttpCache
}                                                                                                         from "./HttpCache";

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
	
	generateKey?(
		key: string | undefined,
		url: string | undefined,
		method: unknown,
		params: string,
		data: string
	): string;
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

function defaultGenerateKey(
	key: string,
	url: string | undefined,
	method: unknown,
	params = "HTTP_NULL_PARAM",
	data = "HTTP_NULL_DATA"
): string {
	return btoa(encodeURIComponent(`${key}&${url}${method}&${JSON.stringify(params)}-${JSON.stringify(data)}`));
}

function AdapterHandle(
	config: AxiosRequestConfig,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): AxiosPromise {
	const generateKey: string = options.generateKey(options.key, config.url, config.method, config.params, config.data);
	const value: any | null = options.cache.get(generateKey, config.expire ?? options.maxAge);
	if (value === null) {
		return axios.request(config).then(getOnSetCache(config, options, generateKey));
	}
	if (process.env.NODE_ENV !== "production") {
		console.info(`${generateKey}命中缓存`);
	}
	return Promise.resolve(value);
}

function getOnSetCache(
	config: AxiosRequestConfig<unknown>,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache },
	generateKey: string
): (response: AxiosResponse) => AxiosResponse<unknown, unknown> {
	return (response: AxiosResponse) => {
		if (
			(config.hit === true || (config.hit !== false && options.enableCache)) &&
			((config.valid && config.valid(response)) || options.valid(response))
		) {
			options.cache.set(generateKey, response);
		}
		return response;
	};
}

function force(config: AxiosRequestConfig, options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }) {
	//删除缓存
	const cache: HttpCache = options.cache;
	const generateKey: string = options.generateKey(options.key, config.url, config.method, config.params, config.data);
	cache.clear(generateKey);
	return axios.request(config).then(getOnSetCache(config, options, generateKey));
}

export function createOptions(
	options: CacheInstance = {}
): Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache } {
	const {
		maxAge = 1000 * 60 * 60,
		key = "HTTP_CACHE_CACHE",
		storage = window.sessionStorage,
		prefix = "AXIOS-CACHE",
		enableCache = false,
		generateKey = defaultGenerateKey,
		valid = () => true,
		message = {
			deserialization: new DeserializationMessageImpl(),
			serialization: new SerializationMessageImpl()
		}
	} = options;
	const cache: HttpCache = new HttpCache(storage, message, prefix);
	return {
		maxAge,
		key,
		storage,
		enableCache,
		generateKey,
		valid,
		message,
		cache
	};
}

export function cacheAdapter(
	defaultAdapter: AxiosAdapter,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): AxiosAdapter {
	return (config: AxiosRequestConfig): AxiosPromise => {
		config.adapter = defaultAdapter;
		return config.force
			? force(config, options)
			: config.hit === true || (config.hit !== false && options.enableCache)
				? AdapterHandle(config, options)
				: axios.request(config);
	};
}

export function createHttpCacheInstance(options: CacheInstance & AxiosRequestConfig): AxiosInstance {
	const op: Omit<Required<CacheInstance>, "prefix"> & AxiosRequestConfig & { cache: HttpCache } =
		createOptions(options);
	const instance: AxiosInstance = axios.create(
		Object.assign(options, {
			adapter: cacheAdapter(axios.defaults.adapter as AxiosAdapter, op)
		})
	);
	return new Proxy<AxiosInstance>(instance, {
		get(target: AxiosInstance, p: string | symbol, receiver: unknown): unknown {
			if (p === "clear") {
				//代理清除函数
				return () => op.cache.clear();
			}
			return Reflect.get(target, p, receiver);
		}
	});
}

axios.withCache = createHttpCacheInstance;
const http: AxiosStatic = axios;
export { http };
