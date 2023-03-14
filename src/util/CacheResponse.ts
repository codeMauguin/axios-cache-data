import { HttpCache } from "@/cache";
import { CacheInstance, RequestOption } from "@/type";
import { extend, extendFn } from "@/util/util";
import { AxiosInstance } from "axios";

function afterProxy(
	response: any,
	key: string,
	config: RequestOption,
	options: Omit<Required<CacheInstance>, "adapter"> & { cache: HttpCache }
): any {
	if (
		extendFn(config.valid, { default: true, args: [response] }) &&
		extendFn(options.valid, { default: true, args: [response] })
	)
		options.cache.set(key, response);
	return response;
}

function getResponse(
	options: Omit<Required<CacheInstance>, "adapter"> & { cache: HttpCache },
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
	const response = options.cache.get(generateKey, requestOption.expire ?? options.maxAge);
	if (response === null) {
		return Promise.resolve(Reflect.apply(target, thisArg, argArray)).then((resp) =>
			afterProxy(resp, generateKey, requestOption, options)
		);
	}
	return Promise.resolve(response);
}

export { getResponse };