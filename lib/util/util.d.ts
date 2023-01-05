import { CacheInstance } from "@/type";
import { HttpCache } from "@/cache/HttpCache";
declare function defaultGenerateKey(key: string | undefined, url: string | undefined, method: unknown, header: unknown, params: string, data: string | object): string;
declare function createOptions(options: CacheInstance): Omit<Required<CacheInstance>, "prefix"> & {
    cache: HttpCache;
};
export { createOptions, defaultGenerateKey };
