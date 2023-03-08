import { AxiosRequestConfig } from "axios";
type Adapter = (config: AxiosRequestConfig) => Promise<any>;
export { Adapter };
