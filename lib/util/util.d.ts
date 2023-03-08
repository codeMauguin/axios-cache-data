import { HttpCache } from "@/cache/HttpCache";
import { CacheInstance, Method } from "@/type";
import { RequestExecute } from "@/type/ExecuteType";
import { AxiosInstance } from "axios/index";
declare function defaultGenerateKey(key: string | undefined, group: string | number, url: string | undefined, method: unknown, header: unknown, params: string, data: string | object): string;
declare function createProxyMethods(target: AxiosInstance, methods: Method[], options: Omit<Required<CacheInstance>, "adapter"> & {
    cache: HttpCache;
}): Record<Method, RequestExecute>;
declare function createOptions(options: CacheInstance): Omit<Required<CacheInstance>, "adapter">;
/**
 * 对参数可能是函数的类型执行
 * @param target 目标
 * @returns
 */
declare function extend<T>(target: T): T | null;
/**
 * 对参数可能是函数的类型执行
 * @param target 函数
 * @param args
 * @returns
 */
declare function extend<T>(this: any, target: (...args: any[]) => T, ...args: any[]): T | null;
declare function extend<T>(this: any, target: T | ((...args: any[]) => T), ...args: any[]): T | null;
export { createOptions, defaultGenerateKey, extend, createProxyMethods };
