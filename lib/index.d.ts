import { AxiosResponse as AxiosResponse$1, AxiosPromise, CreateAxiosDefaults, AxiosInstance } from 'axios';

/** @format */

declare abstract class HttpCacheLike {
    protected storage: Storage;
    protected readonly prefix: string;
    protected message: {
        serialization: Serialization;
        deserialization: Deserialization;
    };
    protected constructor(storage: Storage, message: {
        serialization: Serialization;
        deserialization: Deserialization;
    }, prefix: any);
    abstract get(key: string, timeout: number): unknown | null;
    abstract set(requestKey: string, axiosPromise: unknown): void;
    abstract clear(key?: string): void;
}
declare class HttpCache extends HttpCacheLike {
    constructor(storage: Storage, message: {
        serialization: Serialization;
        deserialization: Deserialization;
    }, prefix: any);
    /**
     * 是否过期
     * @param {number} expired 过期时间
     * @param {number} oldTime 旧的时间
     * @return {true} 过期
     * @return {false}  没有过期
     * @private
     */
    private static isExpired;
    get(key: string, timeout: number): any | null;
    set(key: string, axiosPromise: object): void;
    /**
     * 删除key
     * @param {string} key 存在则删除 不存在则删除所有 包含key 的
     */
    clear(key?: string): void;
}

/** @format */
type CacheMessage = {
    readonly value: any;
    readonly expire: number;
};
declare abstract class Serialization {
    /**
     *将对象序列化
     * @param value
     * @returns {string}
     */
    abstract serialization(value: CacheMessage): string;
    serializationKey(value: string): string;
}
declare abstract class Deserialization {
    abstract deserialization(value: string): CacheMessage;
    deserializationKey(value: string): string;
}

/** @format */

declare class SerializationMessageImpl extends Serialization {
    serialization(value: CacheMessage): string;
}
declare class DeserializationMessageImpl extends Deserialization {
    deserialization(value: string): CacheMessage;
}

/** @format */

interface RequestOption {
    readonly hit?: boolean;
    readonly force?: boolean;
    readonly expire?: number;
    valid?(response: AxiosResponse$1): boolean;
}
interface CacheInstance {
    /**
     * @default 1000*60*60
     */
    readonly maxAge?: number;
    readonly key?: string;
    readonly storage?: Storage;
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
    valid?(response: AxiosResponse$1): boolean;
    generateKey?(key: string | undefined, url: string | undefined, method: unknown, header: unknown, params: string, data: string | object): string;
}

declare function CacheAdapter(key: string, config: RequestOption, options: Omit<Required<CacheInstance>, "prefix">, cache: HttpCache): AxiosPromise | null;

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
declare function http(config: CreateAxiosDefaults, options?: CacheInstance): AxiosInstance;
declare namespace http {
    var proxy: typeof proxy;
}
declare function proxy(instance: AxiosInstance, options?: CacheInstance): AxiosInstance;

export { CacheAdapter, CacheInstance, CacheMessage, Deserialization, DeserializationMessageImpl, HttpCache, HttpCacheLike, RequestOption, Serialization, SerializationMessageImpl, http, proxy };
