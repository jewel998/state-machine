[@jewel998/state-machine - v0.0.3](../README.md) / IValidationStrategy

# Interface: IValidationStrategy\<TConfig\>

Strategy pattern for different validation and execution strategies

## Type parameters

| Name |
| :------ |
| `TConfig` |

## Implemented by

- [`BasicConfigurationValidator`](../classes/BasicConfigurationValidator.md)
- [`ConfigurationValidator`](../classes/ConfigurationValidator.md)
- [`StateReachabilityValidator`](../classes/StateReachabilityValidator.md)
- [`TransitionConsistencyValidator`](../classes/TransitionConsistencyValidator.md)

## Table of contents

### Methods

- [validate](IValidationStrategy.md#validate)

## Methods

### validate

▸ **validate**(`config`): [`ValidationResult`](ValidationResult.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `TConfig` |

#### Returns

[`ValidationResult`](ValidationResult.md)

#### Defined in

[src/patterns/Strategy.ts:6](https://github.com/jewel998/state-machine/blob/main/src/patterns/Strategy.ts#L6)
