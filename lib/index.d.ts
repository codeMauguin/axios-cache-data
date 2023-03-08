import { AxiosResponse as AxiosResponse$1, AxiosRequestConfig, CreateAxiosDefaults, AxiosInstance } from 'axios';

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

interface RequestOption {
    readonly hit?: boolean;
    readonly force?: boolean;
    readonly expire?: number;
    readonly group?: string | number;
    valid?(response: AxiosResponse$1): boolean;
}
interface CacheInstance {
    /**
     * @default 1000*60*60
     */
    readonly maxAge?: number;
    readonly key?: string;
    readonly storage?: Storage;
    readonly proxy?: Method[];
    readonly adapter?: Adapter | Adapter[];
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
    generateKey?(key: string | undefined, group: string | number, url: string | undefined, method: unknown, header: unknown, params: string, data: string | object | any): string;
}

type Method = "request" | "get" | "delete" | "head" | "options" | "post" | "put" | "patch" | "clear";

type Adapter = (config: AxiosRequestConfig) => Promise<any>;

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
        group?: string | number;
        valid?(response: AxiosResponse): boolean;
    }
}
declare function http(config: CreateAxiosDefaults, options?: CacheInstance): AxiosInstance;
declare namespace http {
    var proxy: typeof proxy;
}
declare function proxy(instance: AxiosInstance, options?: CacheInstance): AxiosInstance;

declare abstract class Cache {
    protected readonly defaultOptions: Required<CacheInstance>;
    private readonly cache;
    private proxyMethod;
    protected constructor(options: CacheInstance);
    request<T = any, R = AxiosResponse$1<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    clear(config?: AxiosRequestConfig): void;
    private getOnfulfilled;
    private realRequest;
    private proxyRequest;
    private beforeStore;
    private key;
}
declare class CacheAxios extends Cache {
    constructor(options?: CacheInstance);
    static create(options?: CacheInstance): CacheAxios;
    request<T = any, R = AxiosResponse$1<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    clear(config?: AxiosRequestConfig<any> | undefined): void;
    getUri(config: AxiosResponse$1<any>): Promise<AxiosResponse$1<any, any>>;
    get<T = any, R = AxiosResponse$1<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = AxiosResponse$1<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = AxiosResponse$1<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = AxiosResponse$1<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    postForm<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    putForm<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patchForm<T = any, R = AxiosResponse$1<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    private beforeConfig;
}

export { CacheInstance, Method, RequestOption, CacheAxios as default, http, proxy };
