import { HttpCache } from "@/cache/HttpCache";
import { DeserializationMessageImpl, SerializationMessageImpl } from "@/cache/HttpCacheMessage";
import { LRUCacheSessionStorage } from "@/cache/LRUCache";
import { OneProxy, ThreeProxy, TwoProxy } from "@/core";
import { CacheInstance, Method } from "@/type";
import { RequestExecute } from "@/type/ExecuteType";
import { AxiosInstance } from "axios/index";

const DEFAULT_METHOD: Method[] = ["get", "post"];

function defaultGenerateKey(
	key: string | undefined,
	group: string | number,
	url: string | undefined,
	method: unknown,
	header: unknown,
	params: string,
	data: string | object
): string {
	return btoa(
		encodeURIComponent(
			`${key}&${group}&${url}${method}&${JSON.stringify(header)}&${JSON.stringify(params)}-${JSON.stringify(
				data
			)}`
		)
	);
}

function createProxyMethods(
	target: AxiosInstance,
	methods: Method[],
	options: Omit<Required<CacheInstance>, "adapter"> & { cache: HttpCache }
): Record<Method, RequestExecute> {
	const record: Record<string, RequestExecute> = {};
	for (let i = 0; i < methods.length; ++i) {
		const proxyTarget = Reflect.get(target, methods[i], target);
		if (!proxyTarget) continue;
		const method: Method = methods[i];
		switch (method) {
			case "delete":
			case "head":
			case "options":
			case "get":
				{
					record[method] = new Proxy<RequestExecute>(proxyTarget, TwoProxy(method, options));
				}
				break;
			case "request":
				{
					record[method] = new Proxy<RequestExecute>(proxyTarget, OneProxy(method, options));
				}
				break;
			case "post":
			case "put":
			case "patch":
				{
					record[method] = new Proxy<RequestExecute>(proxyTarget, ThreeProxy(method, options));
				}
				break;
		}
	}
	return record;
}

function createOptions(options: CacheInstance): Omit<Required<CacheInstance>, "adapter"> {
	const {
		maxAge = 1000 * 60 * 60,
		key = "HTTP_CACHE_CACHE",
		storage = new LRUCacheSessionStorage(),
		prefix = "AXIOS-CACHE",
		enableCache = false,
		generateKey = defaultGenerateKey,
		valid = () => true,
		message = {
			deserialization: new DeserializationMessageImpl(),
			serialization: new SerializationMessageImpl()
		},
		proxy = DEFAULT_METHOD
	} = options;

	return {
		maxAge,
		key,
		storage,
		enableCache,
		generateKey,
		valid,
		message,
		proxy,
		prefix
	};
}

function extendFn<T>(this: any, target: ((...args: any[]) => T) | undefined, options: { args: any[]; default: T }): T;
/**
 * ExtendFn 接受一个目标函数和一个选项对象。目标函数接受任意数量的参数并返回 T。options 对象有一个 args 属性，它是一个任意数组和一个 default 属性，它是一个 T。该函数返回一个 T。
 *
 * @param {any}  - 这个：任何
 * @param {((...args: any[]) => T) | undefined} target - ((...args: any[]) => T) |不明确的
 * @param options - { 参数：任何[]；默认值：T}
 * @returns 如果对象是空返回默认设置值。否则执行对象并返回运行结果
 */
function extendFn<T>(this: any, target: ((...args: any[]) => T) | undefined, options: { args: any[]; default: T }): T {
	if (Object.is(target, null) || Object.is(target, void 0)) return options.default;
	/* 接受目标和选项对象的函数。 target 是一个函数，它接受任意数量的参数并返回一个 T。options 对象有一个 args 属性，它是一个 any 数组和一个 default 属性，它是一个 T。该函数返回一个 T。 */
	return Reflect.apply(<(...args: any[]) => T>target, this, options.args);
}

/**
 * 对参数可能是函数的类型执行
 * @param target 目标
 * @returns
 */
function extend<T>(target: T): T | null;
/**
 * 对参数可能是函数的类型执行
 * @param target 函数
 * @param args
 * @returns
 */
function extend<T>(this: any, target: (...args: any[]) => T, ...args: any[]): T | null;

function extend<T>(this: any, target: T | ((...args: any[]) => T), ...args: any[]): T | null;
function extend<T>(this: any, target: T | ((...args: any[]) => T), ...args: any[]): T | null {
	if (Object.is(target, null) || Object.is(target, void 0)) return null;
	if (typeof target === "function") {
		try {
			return Reflect.apply(target, this, args);
		} catch (e) {
			return null;
		}
	}
	return target;
}

export { createOptions, defaultGenerateKey, extend, createProxyMethods, extendFn };