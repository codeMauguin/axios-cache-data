import { HttpCache } from "@/cache";
import { CacheInstance, RequestOption } from "@/type";
import { getResponse } from "@/util";
import { AxiosInstance } from "axios";

interface CacheProxy<T extends object> {
	(method: string, options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }): ProxyHandler<T>;
}

const ThreeProxy: CacheProxy<any> = function (
	method: string,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): ProxyHandler<AxiosInstance> {
	return {
		apply(target: any, thisArg: any, argArray: any[]): any {
			const requestOption = {
				hit: argArray[2]?.hit,
				force: argArray[2]?.force,
				expire: argArray[2]?.expire,
				valid: argArray[2]?.valid
			};
			const url = argArray[0];
			const generateKey = options.generateKey(
				options.key,
				argArray[0],
				method,
				argArray[2]?.header ?? null,
				argArray[2]?.params ?? null,
				argArray[1] ?? null
			);
			return getResponse(options, url, method, requestOption, target, thisArg, argArray, generateKey);
		}
	};
};

const TwoProxy: CacheProxy<any> = function (
	key: string,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): ProxyHandler<any> {
	return {
		apply(target: any, thisArg: any, argArray: any[]): any {
			const requestOption = {
				hit: argArray[1]?.hit,
				force: argArray[1]?.force,
				expire: argArray[1]?.expire,
				valid: argArray[1]?.valid
			};
			const url = argArray[0];
			const generateKey = options.generateKey(
				options.key,
				argArray[0],
				key,
				argArray[1]?.header,
				argArray[1]?.params ?? null,
				argArray[1]?.data ?? null
			);
			return getResponse(options, url, key, requestOption, target, thisArg, argArray, generateKey);
		}
	};
};

const OneProxy: CacheProxy<any> = function (
	key: string,
	options: Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache }
): ProxyHandler<any> {
	return {
		apply(target: any, thisArg: any, argArray: any[]): any {
			const requestOption: RequestOption = {
				hit: argArray[0]?.hit,
				force: argArray[0]?.force,
				expire: argArray[0]?.expire,
				valid: argArray[0]?.valid
			};
			const url: string = argArray[0].url;
			const method = argArray[1].method ?? "get";
			const generateKey: string = options.generateKey(
				options.key,
				argArray[0]?.url,
				key,
				argArray[0]?.header,
				argArray[0]?.params ?? null,
				argArray[0]?.data ?? null
			);
			return getResponse(options, url, method, requestOption, target, thisArg, argArray, generateKey);
		}
	};
};

export { CacheProxy, OneProxy, TwoProxy, ThreeProxy };
