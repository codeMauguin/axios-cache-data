import { CacheInstance, RequestOption } from "@/type";
import { AxiosPromise } from "axios";
import { HttpCache } from "@/cache";

function CacheAdapter(
	key: string,
	config: RequestOption,
	options: Omit<Required<CacheInstance>, "prefix">,
	cache: HttpCache
): AxiosPromise | null {
	return cache.get(key, config.expire ?? options.maxAge);
}
export { CacheAdapter };
