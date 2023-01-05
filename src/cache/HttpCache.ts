/** @format */

import { CacheMessage, Deserialization, Serialization } from "@/cache";

export abstract class HttpCacheLike {
	protected storage: Storage;
	protected readonly prefix: string;
	protected message: {
		serialization: Serialization;
		deserialization: Deserialization;
	};

	protected constructor(
		storage: Storage,
		message: { serialization: Serialization; deserialization: Deserialization },
		prefix
	) {
		this.storage = storage;
		this.message = message;
		this.prefix = prefix;
	}

	abstract get(key: string, timeout: number): unknown | null;

	abstract set(requestKey: string, axiosPromise: unknown): void;

	abstract clear(key?: string): void;
}

export class HttpCache extends HttpCacheLike {
	constructor(storage: Storage, message: { serialization: Serialization; deserialization: Deserialization }, prefix) {
		super(storage, message, prefix);
	}

	/**
	 * 是否过期
	 * @param {number} expired 过期时间
	 * @param {number} oldTime 旧的时间
	 * @return {true} 过期
	 * @return {false}  没有过期
	 * @private
	 */
	private static isExpired(expired: number, oldTime: number): boolean {
		return new Date().getTime() >= oldTime + expired;
	}

	public get(key: string, timeout: number): any | null {
		const s: string = this.message.serialization.serializationKey(`${this.prefix}:${key}`);
		const item: string | null = this.storage.getItem(s);
		if (item === null || item === void 0) return null;
		const message: CacheMessage = this.message.deserialization.deserialization(item);
		if (HttpCache.isExpired(message.expire, timeout)) {
			this.storage.removeItem(s);
			return null;
		}
		return message.value ?? null;
	}

	public set(key: string, axiosPromise: object): void {
		this.storage.setItem(
			this.message.serialization.serializationKey(`${this.prefix}:${key}`),
			this.message.serialization.serialization({
				value: axiosPromise,
				expire: new Date().getTime()
			})
		);
	}

	/**
	 * 删除key
	 * @param {string} key 存在则删除 不存在则删除所有 包含key 的
	 */
	public clear(key?: string) {
		if (key) {
			this.storage.removeItem(this.message.serialization.serializationKey(`${this.prefix}:${key}`));
		} else {
			for (let i = 0; i < this.storage.length; ++i) {
				const s: string | null = this.storage.key(i);
				if (s === null) continue;
				const deserializationKey: string = this.message.deserialization.deserializationKey(s);
				if (deserializationKey.startsWith(this.prefix)) {
					this.storage.removeItem(s);
				}
			}
		}
	}
}
