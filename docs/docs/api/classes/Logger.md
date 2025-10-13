[@jewel998/state-machine - v0.0.3](../README.md) / Logger

# Class: Logger

Production-safe logger implementation
Uses Singleton pattern to ensure consistent logging configuration

## Implements

- `ILogger`

## Table of contents

### Methods

- [getInstance](Logger.md#getinstance)
- [error](Logger.md#error)
- [warn](Logger.md#warn)
- [info](Logger.md#info)
- [debug](Logger.md#debug)
- [setLevel](Logger.md#setlevel)
- [setEnabled](Logger.md#setenabled)
- [configure](Logger.md#configure)

## Methods

### getInstance

▸ **getInstance**(): [`Logger`](Logger.md)

#### Returns

[`Logger`](Logger.md)

#### Defined in

[src/logger.ts:43](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L43)

___

### error

▸ **error**(`message`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...args` | readonly `unknown`[] |

#### Returns

`void`

#### Implementation of

ILogger.error

#### Defined in

[src/logger.ts:98](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L98)

___

### warn

▸ **warn**(`message`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...args` | readonly `unknown`[] |

#### Returns

`void`

#### Implementation of

ILogger.warn

#### Defined in

[src/logger.ts:104](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L104)

___

### info

▸ **info**(`message`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...args` | readonly `unknown`[] |

#### Returns

`void`

#### Implementation of

ILogger.info

#### Defined in

[src/logger.ts:110](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L110)

___

### debug

▸ **debug**(`message`, `...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...args` | readonly `unknown`[] |

#### Returns

`void`

#### Implementation of

ILogger.debug

#### Defined in

[src/logger.ts:116](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L116)

___

### setLevel

▸ **setLevel**(`level`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `level` | [`LogLevel`](../enums/LogLevel.md) |

#### Returns

`void`

#### Implementation of

ILogger.setLevel

#### Defined in

[src/logger.ts:122](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L122)

___

### setEnabled

▸ **setEnabled**(`enabled`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `enabled` | `boolean` |

#### Returns

`void`

#### Implementation of

ILogger.setEnabled

#### Defined in

[src/logger.ts:126](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L126)

___

### configure

▸ **configure**(`config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`\<`LoggerConfig`\> |

#### Returns

`void`

#### Defined in

[src/logger.ts:130](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L130)
