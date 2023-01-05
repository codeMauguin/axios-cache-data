import { CacheInstance } from "@/type";
import { AxiosInstance, CreateAxiosDefaults } from "axios";
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
    var proxy: typeof import("./CacheHttp").proxy;
}
declare function proxy(instance: AxiosInstance, options?: CacheInstance): AxiosInstance;
export { http, proxy };
