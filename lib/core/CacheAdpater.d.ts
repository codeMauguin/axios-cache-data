import { HttpCache } from "@/cache";
import { CacheInstance, RequestOption } from "@/type";
import { AxiosPromise } from "axios";

declare function CacheAdapter(
	key: string,
	config: RequestOption,
	options: Omit<Required<CacheInstance>, "prefix">,
	cache: HttpCache
): AxiosPromise | null;

export { CacheAdapter };
