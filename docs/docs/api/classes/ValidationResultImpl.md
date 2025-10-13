[@jewel998/state-machine - v0.0.3](../README.md) / ValidationResultImpl

# Class: ValidationResultImpl

Validation result implementation

## Implements

- [`ValidationResult`](../interfaces/ValidationResult.md)

## Table of contents

### Constructors

- [constructor](ValidationResultImpl.md#constructor)

### Properties

- [isValid](ValidationResultImpl.md#isvalid)
- [errors](ValidationResultImpl.md#errors)
- [warnings](ValidationResultImpl.md#warnings)

### Methods

- [success](ValidationResultImpl.md#success)
- [failure](ValidationResultImpl.md#failure)
- [combine](ValidationResultImpl.md#combine)

## Constructors

### constructor

• **new ValidationResultImpl**(`isValid`, `errors?`, `warnings?`): [`ValidationResultImpl`](ValidationResultImpl.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `isValid` | `boolean` | `undefined` |
| `errors` | readonly `string`[] | `[]` |
| `warnings` | readonly `string`[] | `[]` |

#### Returns

[`ValidationResultImpl`](ValidationResultImpl.md)

#### Defined in

[src/patterns/Strategy.ts:19](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L19)

## Properties

### isValid

• `Readonly` **isValid**: `boolean`

#### Implementation of

[ValidationResult](../interfaces/ValidationResult.md).[isValid](../interfaces/ValidationResult.md#isvalid)

#### Defined in

[src/patterns/Strategy.ts:20](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L20)

___

### errors

• `Readonly` **errors**: readonly `string`[] = `[]`

#### Implementation of

[ValidationResult](../interfaces/ValidationResult.md).[errors](../interfaces/ValidationResult.md#errors)

#### Defined in

[src/patterns/Strategy.ts:21](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L21)

___

### warnings

• `Readonly` **warnings**: readonly `string`[] = `[]`

#### Implementation of

[ValidationResult](../interfaces/ValidationResult.md).[warnings](../interfaces/ValidationResult.md#warnings)

#### Defined in

[src/patterns/Strategy.ts:22](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L22)

## Methods

### success

▸ **success**(`warnings?`): [`ValidationResult`](../interfaces/ValidationResult.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `warnings` | readonly `string`[] | `[]` |

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

#### Defined in

[src/patterns/Strategy.ts:25](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L25)

___

### failure

▸ **failure**(`errors`, `warnings?`): [`ValidationResult`](../interfaces/ValidationResult.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `errors` | readonly `string`[] | `undefined` |
| `warnings` | readonly `string`[] | `[]` |

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

#### Defined in

[src/patterns/Strategy.ts:29](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L29)

___

### combine

▸ **combine**(`...results`): [`ValidationResult`](../interfaces/ValidationResult.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...results` | readonly [`ValidationResult`](../interfaces/ValidationResult.md)[] |

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

#### Defined in

[src/patterns/Strategy.ts:36](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L36)
