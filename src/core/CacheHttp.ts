import { CacheAdapter } from "@/core";
import { HttpCache } from "@/cache/HttpCache";
import { CacheInstance, RequestOption } from "@/type";
import { createOptions } from "@/util";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
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
function afterProxy(
	response: any,
	key: string,
	config: RequestOption,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): any {
	if ((config.valid && config.valid(response)) || options.valid(response)) options.cache.set(key, response);
	return response;
}

function getResponse(
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache },
	url: string,
	method: string,
	requestOption: RequestOption,
	target: AxiosInstance,
	thisArg: any,
	argArray: any[],
	generateKey: string
): any {
	if (
		requestOption.hit === false ||
		((typeof options.enableCache === "function" ? !options.enableCache(url, method) : !options.enableCache) &&
			!requestOption.hit)
	) {
		return Reflect.apply(target, thisArg, argArray);
	}
	if (requestOption.force) {
		return Promise.resolve(Reflect.apply(target, thisArg, argArray)).then((resp) =>
			afterProxy(resp, generateKey, requestOption, options)
		);
	}
	const response = CacheAdapter(generateKey, requestOption, options, options.cache);
	if (response === null) {
		return Promise.resolve(Reflect.apply(target, thisArg, argArray)).then((resp) =>
			afterProxy(resp, generateKey, requestOption, options)
		);
	}
	if (process.env.NODE_ENV !== "production") {
		console.info(`${generateKey}命中缓存`);
	}
	return Promise.resolve(response);
}

function createProxy(
	target: AxiosInstance,
	key: string | symbol,
	receiver: any,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): any {
	return new Proxy<any>(Reflect.get(target, key, receiver), {
		apply(target, thisArg, argArray): any {
			let requestOption: RequestOption;
			let generateKey: string;
			let url: string;
			let method = key as string;
			switch (method.toLowerCase()) {
			case "delete":
			case "head":
			case "options":
			case "get":
				{
					requestOption = {
						hit: argArray[1]?.hit,
						force: argArray[1]?.force,
						expire: argArray[1]?.expire,
						valid: argArray[1]?.valid
					};
					url = argArray[0];
					generateKey = options.generateKey(
						options.key,
						argArray[0],
						key,
						argArray[1]?.header,
						argArray[1]?.params ?? null,
						argArray[1]?.data ?? null
					);
				}
				break;
			case "geturi":
			case "request":
				{
					requestOption = {
						hit: argArray[0]?.hit,
						force: argArray[0]?.force,
						expire: argArray[0]?.expire,
						valid: argArray[0]?.valid
					};
					url = argArray[0].url;
					method = argArray[1].method ?? "get";
					generateKey = options.generateKey(
						options.key,
						argArray[0]?.url,
						key,
						argArray[0]?.header,
						argArray[0]?.params ?? null,
						argArray[0]?.data ?? null
					);
				}
				break;
			default: {
				requestOption = {
					hit: argArray[2]?.hit,
					force: argArray[2]?.force,
					expire: argArray[2]?.expire,
					valid: argArray[2]?.valid
				};
				url = argArray[0];
				generateKey = options.generateKey(
					options.key,
					argArray[0],
					key,
					argArray[2]?.header ?? null,
					argArray[2]?.params ?? null,
					argArray[1] ?? null
				);
			}
			}
			return getResponse(options, url, method, requestOption, target, thisArg, argArray, generateKey);
		}
	});
}

function http(config: CreateAxiosDefaults, options: CacheInstance = {}): AxiosInstance {
	const instance: AxiosInstance = axios.create(config);
	return proxy(instance, options);
}

function proxy(instance: AxiosInstance, options: CacheInstance = {}): AxiosInstance {
	const record: Record<string | symbol, any> = {};
	const defaultOptions: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache } = createOptions(options);
	record["clear"] = () => defaultOptions.cache.clear();
	return new Proxy<AxiosInstance>(instance, {
		get(target: AxiosInstance, key: string | symbol, receiver: any): any {
			return record[key] ? record[key] : (record[key] = createProxy(target, key, receiver, defaultOptions));
		},
		apply(target, thisArg, argArray) {
			let url: string, method: string;
			let requestOption: RequestOption;
			let generateKey: string;
			if (typeof argArray[0] === "string") {
				url = argArray[0];
				method = argArray[1]?.method ?? "get";
				requestOption = {
					hit: argArray[1]?.hit,
					force: argArray[1]?.force,
					expire: argArray[1]?.expire,
					valid: argArray[1]?.valid
				};
				generateKey = defaultOptions.generateKey(
					options.key,
					argArray[0],
					method,
					argArray[1]?.header ?? null,
					argArray[1]?.params ?? null,
					argArray[1]?.data ?? null
				);
			} else {
				url = argArray[0]?.url;
				method = argArray[0]?.method ?? "get";
				requestOption = {
					hit: argArray[0]?.hit,
					force: argArray[0]?.force,
					expire: argArray[0]?.expire,
					valid: argArray[0]?.valid
				};
				generateKey = defaultOptions.generateKey(
					options.key,
					argArray[0]?.url,
					method,
					argArray[0]?.header ?? null,
					argArray[0]?.params ?? null,
					argArray[0]?.data ?? null
				);
			}
			return getResponse(defaultOptions, url, method, requestOption, target, thisArg, argArray, generateKey);
		}
	});
}

http.proxy = proxy;

axios.withCache = http;
axios.clear = function () {
	throw new Error("方法没有实现");
};

export { http, proxy };
