import { AxiosRequestConfig, AxiosResponse } from "axios";

type RequestExecute =
	| (<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) => Promise<R>)
	| (<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) => Promise<R>)
	| (<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>)
	| (() => void);
export { RequestExecute };
