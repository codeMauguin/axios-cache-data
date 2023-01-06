import { HttpCache } from "@/cache";
import { CacheAdapter } from "@/core";
import { CacheInstance, RequestOption } from "@/type";
import { extend } from "@/util/util";
import { AxiosInstance } from "axios";

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
	const { hit, force } = requestOption;
	if (hit === false || (!extend<boolean>(options.enableCache, url, method) && true !== hit)) {
		return Reflect.apply(target, thisArg, argArray);
	}
	if (force === true) {
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

export { getResponse };
