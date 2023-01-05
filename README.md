<!-- @format -->

# axios-cache-data

![axios-data](https://badgen.net/badge/axios-cache-data/1.10.25/blue?icon=github)
![axios](https://badgen.net/badge/axios/^1.2.2/green?icon=github)
![vite](https://badgen.net/badge/vite/^4.0.3/blue?icon=github)

> `axios`官方文档在这 [axios](https://axios-http.com/)

> Tip：被缓存后所有的响应信息都是初次请求状态，服务器删除该数据或者修改该数据都不会有感知 ，可以设置缓存时间

> Tip：~~axios
> 的[^100])修改（无法获取到正确的 axios 原本的适配器，axios 没有暴露出来），无法完成缓存适配，在测试中下列参数均不对~~
>
> 将 config.adaptor 置*默认*让他重新走原来的适配器，这样不会进入死循环（但是性能上应该不好[^101]
> ：暂时没看到怎么获取他的适配器，只能这样来弥补上）

<!-- TOC -->

-   [axios-cache-data](#axios-cache-data)
    -   [1. 创建缓存实例](#1-%E5%88%9B%E5%BB%BA%E7%BC%93%E5%AD%98%E5%AE%9E%E4%BE%8B)
    -   [2. 强制更新或使用缓存](#2-%E5%BC%BA%E5%88%B6%E6%9B%B4%E6%96%B0%E6%88%96%E4%BD%BF%E7%94%A8%E7%BC%93%E5%AD%98)
        -   [2.1. 序列化数据](#21-%E5%BA%8F%E5%88%97%E5%8C%96%E6%95%B0%E6%8D%AE)
    -   [3. 参数说明](#3-%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)
        -   [3.1. 创建适配器的公共参数](#31-%E5%88%9B%E5%BB%BA%E9%80%82%E9%85%8D%E5%99%A8%E7%9A%84%E5%85%AC%E5%85%B1%E5%8F%82%E6%95%B0)
        -   [3.2. 每一个请求缓存参数](#32-%E6%AF%8F%E4%B8%80%E4%B8%AA%E8%AF%B7%E6%B1%82%E7%BC%93%E5%AD%98%E5%8F%82%E6%95%B0)

<!-- /TOC -->

## 1. 创建缓存实例

```typescript
import axios from "axios";
import { createHttpCacheInstance } from "axios-cache-data";

const instance = axios.create({
	adapter: cacheAdapter(axios.defaults.adapter, {})
}); //或者下面的
const axiosInstance: AxiosInstance = axios.withCache({
	enableCache: true //开全局缓存 所有这个实例方法在没有forceUpdate：true 的都会缓存
});
axiosInstance.get(url, [config]);
axiosInstance.post(url, data, [config]);
//...
```

## 2. 强制更新或使用缓存

```typescript
import axios from "axios";
import { createOptions } from "src/CacheInterceptor";

axiosInstance.post(url, {}, { force: true }); //缓存会失效 并且删除缓存 重新走网络请求
axiosInstance.post(url, {}, { hit: true }); //在没有全局开启缓存这个会开启缓存

const op = createOptions({});
op.cache.clear(); //从op中获取cache clear只会清除有网络缓存有关的key

// 或使用
const instance = axios.withCache(options); //只有这个创建的实例会挂在clear
instance.clear();
```

### 2.1. 序列化数据

```typescript
import axios from "axios";
import { cacheAdapter, CacheInstance } from "lib/index";

cacheAdapter(axios.defaults.adapter, {
	enableCache: true, //开启全局缓存
	message: {
		deserialization: Deserialization, //反序列化
		serialization: Serialization //序列化后存入Storage 建议 加密什么都在这里实现
	}
});
```

## 3. 参数说明

```typescript
export interface CacheInstance extends AxiosRequestConfig {
	/**
	 * @default 1000*60*60
	 */
	readonly maxAge?: number;
	readonly key?: string;
	//存储缓存 {window.sessionStorage| localStorage | 自实现的Storage}
	readonly storage?: Storage;
	readonly enableCache?: boolean;

	/**
	 * 公共的key前缀 生成key需要获取到 因为可以根据prefix删除和网络请求有关的请求
	 */
	readonly prefix?: string;

	/**
	 * 消息转换
	 * 可以在里面配置 敏感信息加密
	 */
	readonly message?: {
		serialization: Serialization; deserialization: Deserialization;
	};

	/**
	 * 验证返回值是否合法 排除错误信息 被保存到了缓存里，导致脏数据
	 * @param {AxiosResponse} response
	 * @return {boolean}
	 */
	valid?(response: AxiosResponse): boolean;

	// 生成一次请求唯一次的key 需要保持一个请求在一个请求参数下保持唯一
	generateKey?(key: string | undefined, url: string | undefined, method: any, params: string, data: string): string;
}

axiosInstance.get(url, {
	hit: true,//开启缓存
	force: true, //强制更新 优先级高于hit
	expire: number, //设置缓存时间 优先级高于 base maxAge
	...
})
```

---

### 3.1. 创建适配器的公共参数

|    参数     |                 介绍                 | 默认值                          |
| :---------: | :----------------------------------: | ------------------------------- |
|   maxAge    |             缓存最大时间             | **1000 _ 60 _ 60** （单位毫秒） |
|     key     |            生成 key 标识             | **HTTP_CACHE_CACHE**            |
|   storage   |               缓存组件               | **window.sessionStorage**       |
|   prefix    |          网络缓 key 存前缀           | **AXIOS-CACHE**                 |
| enableCache |             开启全局缓存             | **false**                       |
| generateKey |       生成一个请求唯一标识 key       |                                 |
|   message   |         消息序列化和反序列化         |                                 |
|    valid    | 验证消息是否正确防止消息错误却被缓存 |                                 |

### 3.2. 每一个请求缓存参数

|  hit   |     是否需要命中缓存(优先级高于全局配置)      |
| :----: | :-------------------------------------------: |
| force  | 强制走网络请求,并刷新缓存（如果开启了缓存的） |
| expire |                   过期时间                    |
| valid  |     验证消息是否正确防止消息错误却被缓存      |

> hit false 全局开启缓存也不会命中缓存

[^100]: #官网没有暴露`getAdapter()`方法
[^101]: #前置工作走了两次
