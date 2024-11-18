import { z } from "zod";

function extractParams(url: string): string[] {
  return url
    .split("/")
    .filter((segment) => segment.startsWith(":"))
    .map((segment) => segment.substring(1));
}

function replaceParams(url: string, params: Record<string, string | number>, keys: string[]): string {
  let _url = url;
  keys.forEach((key) => {
    if (params[key] === undefined) throw new Error(`Parameter for key ${key} is undefined.`);
    _url = _url.replace(`:${key}`, encodeURIComponent(params[key]));
  });
  return _url;
}

function urlTemplate(url: string, params: Record<string, string | number>) {
  const keys = extractParams(url);

  if (keys.length === 0) throw new Error("No query parameters found.");

  const paramKeys = Object.keys(params);
  const missingParams = keys.filter((k) => !paramKeys.includes(k));
  if (missingParams.length > 0) throw new Error(`Missing parameters: ${missingParams.join(", ")}`);

  return replaceParams(url, params, keys);
}

function extractData(rs: Response) {
  const contentType = rs.headers.get("Content-Type");
  if (contentType === "application/text") return rs.text();
  if (contentType === "application/json") return rs.json();
}

export abstract class TheMessager {
  protected static _url = "";
  protected static _schema?: z.ZodType<any>;
  protected static config: RequestInit = {};

  static url(url: string, params?: Record<string, string | number>) {
    this._url = params ? urlTemplate(url, params) : url;
    return this;
  }

  static schema(schema: z.ZodType<any>) {
    this._schema = schema;
    return this;
  }

  static withBearerToken(token: string) {
    this.config.headers = {
      Authorization: `Bearer ${token}`,
      connection: "keepalive",
    };
    return this;
  }

  static async get<T = any>() {
    if (!this._url) throw Error("no url defined, use .url()");
    const rs = await fetch(this._url, this.config);
    if (!rs.ok) return { rs };

    const data = await extractData(rs);
    const safeData = (this?._schema?.parse(data) ?? data) as T;

    return { rs, data: safeData };
  }

  static async post<T = any>(body?: object) {
    if (!this._url) throw Error("no url defined, please define one with .url()");
    const _body = body ? JSON.stringify(body) : undefined;
    const rs = await fetch(this._url, { ...this.config, body: _body, method: "POST" });

    if (!rs.ok) return { rs };
    const data = await extractData(rs);
    const safeData = (this?._schema?.parse(data) ?? data) as T;

    return { rs: rs, data: safeData };
  }

  static async patch<T = any>(body?: object) {
    if (!this._url) throw Error("no url defined, please define one with .url()");
    const _body = body ? JSON.stringify(body) : undefined;
    const rs = await fetch(this._url, { ...this.config, body: _body, method: "PATCH" });

    if (!rs.ok) return { rs };
    const data = await extractData(rs);
    const safeData = (this?._schema?.parse(data) ?? data) as T;

    return { rs: rs, data: safeData };
  }

  static async delete() {
    const rs = await fetch(this._url, { ...this.config, method: "DELETE" });
    return { req: rs };
  }
}
