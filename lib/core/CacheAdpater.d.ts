import { CacheInstance, RequestOption } from "@/type";
import { AxiosPromise } from "axios";
import { HttpCache } from "@/cache";
declare function CacheAdapter(key: string, config: RequestOption, options: Omit<Required<CacheInstance>, "prefix">, cache: HttpCache): AxiosPromise | null;
export { CacheAdapter };
