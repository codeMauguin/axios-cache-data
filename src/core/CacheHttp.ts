import { HttpCache } from "@/cache/HttpCache";
import { OneProxy, TwoProxy } from "@/core/Proxy";
import { CacheInstance, Method, RequestExecute } from "@/type";
import { createOptions, createProxyMethods } from "@/util";
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

function http(config: CreateAxiosDefaults, options: CacheInstance = {}): AxiosInstance {
	const instance: AxiosInstance = axios.create(config);
	return proxy(instance, options);
}

function proxy(instance: AxiosInstance, options: CacheInstance = {}): AxiosInstance {
	const defaultOptions: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache } = createOptions(options);
	//创建代理函数
	const proxyMethods: Record<Method, RequestExecute> = createProxyMethods(
		instance,
		defaultOptions.proxy,
		defaultOptions
	);
	proxyMethods["clear"] = () => defaultOptions.cache.clear();
	const cache: Record<string, boolean> = {};
	//设置缓存
	defaultOptions.proxy.forEach((value: string) => (cache[value] = true));
	return new Proxy<AxiosInstance>(instance, {
		get(target: AxiosInstance, key: string | symbol, receiver: any): any {
			return proxyMethods[key] ? proxyMethods[key] : Reflect.get(target, key, receiver);
		},
		apply(target, thisArg, argArray) {
			if (!argArray || argArray.length === 0) return Reflect.apply(target, thisArg, argArray);
			const b: boolean = typeof argArray[0] === "string";
			const method: string = (b ? argArray[1]?.method : argArray[0]?.method) ?? "get";
			if (cache[method]) {
				const handle: ProxyHandler<AxiosInstance> = b
					? TwoProxy(method, defaultOptions)
					: OneProxy(method, defaultOptions);
				return handle.apply && handle.apply(target, thisArg, argArray);
			}

			return Reflect.apply(target, thisArg, argArray);
		}
	});
}

http.proxy = proxy;

axios.withCache = http;
axios.clear = function () {
	throw new Error("方法没有实现");
};

export { http, proxy };
