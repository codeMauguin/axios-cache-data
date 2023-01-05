import { DeserializationMessageImpl, SerializationMessageImpl } from "@/cache/HttpCacheMessage";
import { CacheInstance } from "@/type";
import { HttpCache } from "@/cache/HttpCache";

function defaultGenerateKey(
	key: string | undefined,
	url: string | undefined,
	method: unknown,
	header: unknown,
	params: string,
	data: string | object
): string {
	return btoa(
		encodeURIComponent(
			`${key}&${url}${method}&${JSON.stringify(header)}&${JSON.stringify(params)}-${JSON.stringify(data)}`
		)
	);
}
function createOptions(options: CacheInstance): Omit<Required<CacheInstance>, "prefix"> & { cache: HttpCache } {
	const {
		maxAge = 1000 * 60 * 60,
		key = "HTTP_CACHE_CACHE",
		storage = window.sessionStorage,
		prefix = "AXIOS-CACHE",
		enableCache = false,
		generateKey = defaultGenerateKey,
		valid = () => true,
		message = {
			deserialization: new DeserializationMessageImpl(),
			serialization: new SerializationMessageImpl()
		}
	} = options;
	const cache: HttpCache = new HttpCache(storage, message, prefix);
	return {
		maxAge,
		key,
		storage,
		enableCache,
		generateKey,
		valid,
		message,
		cache
	};
}

export { createOptions, defaultGenerateKey };
