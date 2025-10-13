[@jewel998/state-machine - v0.0.3](../README.md) / ValidationContext

# Class: ValidationContext\<TConfig\>

Context class for Strategy pattern

## Type parameters

| Name |
| :------ |
| `TConfig` |

## Table of contents

### Constructors

- [constructor](ValidationContext.md#constructor)

### Methods

- [setStrategy](ValidationContext.md#setstrategy)
- [validate](ValidationContext.md#validate)

## Constructors

### constructor

• **new ValidationContext**\<`TConfig`\>(`strategy`): [`ValidationContext`](ValidationContext.md)\<`TConfig`\>

#### Type parameters

| Name |
| :------ |
| `TConfig` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `strategy` | [`IValidationStrategy`](../interfaces/IValidationStrategy.md)\<`TConfig`\> |

#### Returns

[`ValidationContext`](ValidationContext.md)\<`TConfig`\>

#### Defined in

[src/patterns/Strategy.ts:53](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L53)

## Methods

### setStrategy

▸ **setStrategy**(`strategy`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `strategy` | [`IValidationStrategy`](../interfaces/IValidationStrategy.md)\<`TConfig`\> |

#### Returns

`void`

#### Defined in

[src/patterns/Strategy.ts:57](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L57)

___

### validate

▸ **validate**(`config`): [`ValidationResult`](../interfaces/ValidationResult.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `TConfig` |

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

#### Defined in

[src/patterns/Strategy.ts:61](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L61)
