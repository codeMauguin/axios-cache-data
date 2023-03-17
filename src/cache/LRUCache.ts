class LRUCacheSessionStorage<T extends string> implements Storage {
	maxSize: number;
	cache: { [key: string]: T };
	queue: string[];
	public readonly length: number;

	[name: string]: any;

	public clear(): void {}

	getItem(key: string): string | null {
		if (this.cache.hasOwnProperty(key)) {
			// 如果查找到了对应的 value，则将 key 移到队尾
			this.queue.splice(this.queue.indexOf(key), 1);
			this.queue.push(key);
			sessionStorage.setItem("LRUCacheSessionStorageQueue", JSON.stringify(this.queue));
			return this.cache[key];
		} else {
			// 如果没有找到对应的 value，则返回 undefined
			return null;
		}
	}

	public key(index: number): string | null {
		return Object.keys(this.cache)[index];
	}

	public removeItem(key: string): void {
		Reflect.deleteProperty(this.cache, key);
		this.queue.splice(this.queue.indexOf(key), 1);
		// 将 cache 和 queue 保存至 sessionStorage 中
		sessionStorage.setItem("LRUCacheSessionStorage", JSON.stringify(this.cache));
		sessionStorage.setItem("LRUCacheSessionStorageQueue", JSON.stringify(this.queue));
	}

	setItem(key: string, value: T): void {
		if (this.cache.hasOwnProperty(key)) {
			// 如果已经存在相同的 key，则更新其 value 并将其移到队尾
			this.queue.splice(this.queue.indexOf(key), 1);
		} else if (this.queue.length === this.maxSize) {
			// 如果队列已达到最大容量，则删除队首元素
			const oldestKey = this.queue.shift()!;
			delete this.cache[oldestKey];
		}

		// 将新的 key 加入队尾
		this.queue.push(key);

		// 更新 cache
		this.cache[key] = value;

		// 将 cache 和 queue 保存至 sessionStorage 中
		sessionStorage.setItem("LRUCacheSessionStorage", JSON.stringify(this.cache));
		sessionStorage.setItem("LRUCacheSessionStorageQueue", JSON.stringify(this.queue));
	}

	constructor(maxSize?: number) {
		this.maxSize = maxSize || 10;
		this.cache = JSON.parse(sessionStorage.getItem("LRUCacheSessionStorage") || "{}");
		this.queue = JSON.parse(sessionStorage.getItem("LRUCacheSessionStorageQueue") || "[]");
	}
}

export { LRUCacheSessionStorage };