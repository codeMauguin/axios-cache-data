import { HttpCache } from "@/cache";
import { CacheInstance, RequestOption } from "@/type";
import { AxiosInstance } from "axios";

declare function getResponse(
	options: Omit<Required<CacheInstance>, "adapter"> & {
		cache: HttpCache;
	},
	url: string,
	method: string,
	requestOption: RequestOption,
	target: AxiosInstance,
	thisArg: any,
	argArray: any[],
	generateKey: string
): any;

export { getResponse };
