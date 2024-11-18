# the-messager

![The Messenger](https://github.com/martin76ec/repo-images/blob/master/the-messager.png)

Typescript, zod templated, not blazingly fast, poorly designed nodejs fetch wrapper

## How to use

### Import

```js
import { TheMessager } from "the-messager";
```

### Request

```js
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager").get();
```

### Params

Params as object

```js
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager?param=:param", { param: "message" }).get();
```

Params as array

```js
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager?param=:param&param2=:param2", {
    param: "message",
    param2: "message 2"
}).get();
```

### Using zod to transform the response data

```js
const schema = z.object({ message: z.string() });
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager").schema(schema).get<z.infer<typeof schema>>();
```

### Available methods

Post, Patch (formdata or object)

```js
const payload = { "message-id": "BNEU-128-EE558" }; // it also accepts FormData instances
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager").post(payload);
```

```js
const payload = new FormData();
payload.append("message-id", "BNEU-128-EE558");

const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager").patch(payload);
```

Delete

```js
const { rs, data } = await TheMessager.url("https://martinlarrea.com/the-messager?id=:id", { id: 123 }).delete();
```
