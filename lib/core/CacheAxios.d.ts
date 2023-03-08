import { CacheInstance } from "@/type";
import { AxiosRequestConfig, AxiosResponse } from "axios";
declare abstract class Cache {
    protected readonly defaultOptions: Required<CacheInstance>;
    private readonly cache;
    private proxyMethod;
    protected constructor(options: CacheInstance);
    request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
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
    request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    clear(config?: AxiosRequestConfig<any> | undefined): void;
    getUri(config: AxiosResponse<any>): Promise<AxiosResponse<any, any>>;
    get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    postForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    putForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patchForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    private beforeConfig;
}
export default CacheAxios;
