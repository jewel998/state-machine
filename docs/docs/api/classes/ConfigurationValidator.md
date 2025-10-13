[@jewel998/state-machine - v0.0.3](../README.md) / ConfigurationValidator

# Class: ConfigurationValidator\<TContext, TState, TEvent\>

Strategy pattern for different validation and execution strategies

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Implements

- [`IValidationStrategy`](../interfaces/IValidationStrategy.md)\<[`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>\>

## Table of contents

### Constructors

- [constructor](ConfigurationValidator.md#constructor)

### Methods

- [validate](ConfigurationValidator.md#validate)

## Constructors

### constructor

• **new ConfigurationValidator**\<`TContext`, `TState`, `TEvent`\>(`strategies?`): [`ConfigurationValidator`](ConfigurationValidator.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `strategies` | readonly [`IValidationStrategy`](../interfaces/IValidationStrategy.md)\<[`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>\>[] | `[]` |

#### Returns

[`ConfigurationValidator`](ConfigurationValidator.md)\<`TContext`, `TState`, `TEvent`\>

#### Defined in

[src/validation/ConfigurationValidator.ts:31](https://github.com/jewel998/state-machine/blob/main/src/validation/ConfigurationValidator.ts#L31)

## Methods

### validate

▸ **validate**(`config`): [`ValidationResult`](../interfaces/ValidationResult.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\> |

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

#### Implementation of

[IValidationStrategy](../interfaces/IValidationStrategy.md).[validate](../interfaces/IValidationStrategy.md#validate)

#### Defined in

[src/validation/ConfigurationValidator.ts:44](https://github.com/jewel998/state-machine/blob/main/src/validation/ConfigurationValidator.ts#L44)
