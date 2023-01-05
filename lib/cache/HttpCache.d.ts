/** @format */
import { Deserialization, Serialization } from "@/cache";
export declare abstract class HttpCacheLike {
    protected storage: Storage;
    protected readonly prefix: string;
    protected message: {
        serialization: Serialization;
        deserialization: Deserialization;
    };
    protected constructor(storage: Storage, message: {
        serialization: Serialization;
        deserialization: Deserialization;
    }, prefix: any);
    abstract get(key: string, timeout: number): unknown | null;
    abstract set(requestKey: string, axiosPromise: unknown): void;
    abstract clear(key?: string): void;
}
export declare class HttpCache extends HttpCacheLike {
    constructor(storage: Storage, message: {
        serialization: Serialization;
        deserialization: Deserialization;
    }, prefix: any);
    /**
     * 是否过期
     * @param {number} expired 过期时间
     * @param {number} oldTime 旧的时间
     * @return {true} 过期
     * @return {false}  没有过期
     * @private
     */
    private static isExpired;
    get(key: string, timeout: number): any | null;
    set(key: string, axiosPromise: object): void;
    /**
     * 删除key
     * @param {string} key 存在则删除 不存在则删除所有 包含key 的
     */
    clear(key?: string): void;
}
