/** @format */
import { Deserialization, Serialization } from "@/cache";
import { Adapter, Method } from "@/type";
import { AxiosResponse } from "axios";
interface RequestOption {
    readonly hit?: boolean;
    readonly force?: boolean;
    readonly expire?: number;
    readonly group?: string | number;
    valid?(response: AxiosResponse): boolean;
}
interface CacheInstance {
    /**
     * @default 1000*60*60
     */
    readonly maxAge?: number;
    readonly key?: string;
    readonly storage?: Storage;
    readonly proxy?: Method[];
    readonly adapter?: Adapter | Adapter[];
    readonly enableCache?: boolean | ((url: string, method: string) => boolean);
    /**
     * 公共的key前缀 生成key需要获取到
     */
    readonly prefix?: string;
    /**
     * 消息转换
     */
    readonly message?: {
        serialization: Serialization;
        deserialization: Deserialization;
    };
    valid?(response: AxiosResponse): boolean;
    generateKey?(key: string | undefined, group: string | number, url: string | undefined, method: unknown, header: unknown, params: string, data: string | object | any): string;
}
export type { CacheInstance, RequestOption };
