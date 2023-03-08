import { HttpCache } from "@/cache";
import { CacheInstance } from "@/type";
interface CacheProxy<T extends object> {
    (method: string, options: Omit<Required<CacheInstance>, "adapter"> & {
        cache: HttpCache;
    }): ProxyHandler<T>;
}
declare const ThreeProxy: CacheProxy<any>;
declare const TwoProxy: CacheProxy<any>;
declare const OneProxy: CacheProxy<any>;
export { CacheProxy, OneProxy, TwoProxy, ThreeProxy };
