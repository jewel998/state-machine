[@jewel998/state-machine - v0.0.3](../README.md) / IdGenerator

# Class: IdGenerator

Utility for generating unique IDs

## Table of contents

### Constructors

- [constructor](IdGenerator.md#constructor)

### Methods

- [generateTransitionId](IdGenerator.md#generatetransitionid)
- [generateUniqueId](IdGenerator.md#generateuniqueid)
- [reset](IdGenerator.md#reset)

## Constructors

### constructor

• **new IdGenerator**(): [`IdGenerator`](IdGenerator.md)

#### Returns

[`IdGenerator`](IdGenerator.md)

## Methods

### generateTransitionId

▸ **generateTransitionId**(): `string`

#### Returns

`string`

#### Defined in

[src/utils/IdGenerator.ts:8](https://github.com/jewel998/state-machine/blob/main/src/utils/IdGenerator.ts#L8)

___

### generateUniqueId

▸ **generateUniqueId**(`prefix?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `prefix` | `string` | `'id'` |

#### Returns

`string`

#### Defined in

[src/utils/IdGenerator.ts:15](https://github.com/jewel998/state-machine/blob/main/src/utils/IdGenerator.ts#L15)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/IdGenerator.ts:21](https://github.com/jewel998/state-machine/blob/main/src/utils/IdGenerator.ts#L21)
