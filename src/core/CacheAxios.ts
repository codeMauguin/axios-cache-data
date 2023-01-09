import { HttpCache } from "@/cache";
import { CacheInstance, Method, RequestOption } from "@/type";
import { createOptions, extend } from "@/util";
import { AxiosRequestConfig, AxiosResponse } from "axios";

type ProxyMethod = {
	[key in Method]: boolean;
};

function afterProxy<T = any>(
	response: any,
	key: string,
	config: RequestOption,
	options: Required<CacheInstance>,
	cache: HttpCache
): T {
	if ((config.valid && config.valid(response)) || options.valid(response)) {
		cache.set(key, response);
	} else {
		cache.clear(key);
	}
	return response;
}

function isPromise(promise: Promise<any>): boolean {
	return typeof promise === "object" && typeof promise.then === "function" && typeof promise.catch === "function";
}

abstract class Cache {
	protected readonly defaultOptions: Required<CacheInstance>;
	private readonly cache: HttpCache;
	private proxyMethod: ProxyMethod = {
		clear: false,
		delete: false,
		get: false,
		head: false,
		options: false,
		patch: false,
		post: false,
		put: false,
		request: false
	};

	protected constructor(options: CacheInstance) {
		this.defaultOptions = Object.assign(createOptions(options), {
			adapter: options.adapter ? (!Array.isArray(options.adapter) ? [options.adapter] : options.adapter) : []
		});
		this.cache = new HttpCache(
			this.defaultOptions.storage,
			this.defaultOptions.message,
			this.defaultOptions.prefix
		);
		this.defaultOptions.proxy.forEach((value) => (this.proxyMethod[value] = true));
	}

	public request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
		if (!this.beforeStore(config)) {
			const generateKey: string = this.key(config) as string;
			return config.force
				? this.realRequest(config).then(this.getOnfulfilled(generateKey, config))
				: this.proxyRequest(config, generateKey);
		}
		return this.realRequest(config);
	}

	public clear(config?: AxiosRequestConfig) {
		this.cache.clear(this.key(config));
	}

	private getOnfulfilled<D, R = AxiosResponse<D>>(
		generateKey: string,
		config: AxiosRequestConfig<D>
	): (resp: AxiosResponse<D>) => PromiseLike<R> | R {
		return (resp: AxiosResponse<D>) => afterProxy<R>(resp, generateKey, config, this.defaultOptions, this.cache);
	}

	private realRequest<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig): Promise<R> {
		if (Array.isArray(this.defaultOptions.adapter)) {
			for (let i = 0; i < this.defaultOptions.adapter.length; ++i) {
				const promise: Promise<any> = this.defaultOptions.adapter[i](config);
				if (promise !== null && promise !== void 0) {
					//加入结果校验
					return isPromise(promise) ? promise : Promise.resolve(promise);
				}
			}
		}
		return Promise.reject("adapter not implements!!!");
	}

	private proxyRequest<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig, key: string): Promise<R> {
		let promise: Promise<any>;
		if ((promise = this.cache.get(key, config.expire ?? this.defaultOptions.maxAge))) {
			return isPromise(promise) ? promise : Promise.resolve(promise);
		} else {
			return this.realRequest(config).then(this.getOnfulfilled(key, config));
		}
	}

	private beforeStore(config: AxiosRequestConfig): boolean {
		return (
			!this.proxyMethod[config.method as string] ||
			config.hit === false ||
			(!config.hit && !extend(this.defaultOptions.enableCache, config.url, config.method))
		);
	}

	private key<D = any>(config?: AxiosRequestConfig<D>): string | null {
		return config
			? this.defaultOptions.generateKey(
					this.defaultOptions.key,
					config.url,
					config.method,
					config.headers,
					config.params,
					config.data
			  )
			: null;
	}
}

class CacheAxios extends Cache {
	constructor(options: CacheInstance = {}) {
		super(options);
	}

	static create(options: CacheInstance = {}): CacheAxios {
		return new CacheAxios(options);
	}

	public request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
		config.method = config.method ?? "get";
		return super.request(config);
	}

	public clear(config?: AxiosRequestConfig<any> | undefined): void {
		super.clear(config);
	}

	public getUri(config: AxiosResponse<any>) {
		return this.request(config);
	}

	public get<T = any, R = AxiosResponse<T>, D = any>(url: string, config: AxiosRequestConfig<D> = {}): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url));
	}

	public delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config: AxiosRequestConfig<D> = {}): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "delete"));
	}

	public head<T = any, R = AxiosResponse<T>, D = any>(url: string, config: AxiosRequestConfig<D> = {}): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "head"));
	}

	public options<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "options"));
	}

	public post<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "post", data));
	}

	public put<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "put", data));
	}

	public patch<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "patch", data));
	}

	postForm<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "postForm", data));
	}

	putForm<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "putForm", data));
	}

	patchForm<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: D,
		config: AxiosRequestConfig<D> = {}
	): Promise<R> {
		return this.request<T, R, D>(this.beforeConfig(config, url, "patchForm", data));
	}

	private beforeConfig<D = any>(
		config: AxiosRequestConfig,
		url?: string,
		method?: string,
		data?: D
	): AxiosRequestConfig {
		config.url = url ?? config.url;
		config.method = method ?? config.method;
		config.data = data ?? config.data;
		return config;
	}
}

export default CacheAxios;
