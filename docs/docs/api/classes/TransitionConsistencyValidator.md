[@jewel998/state-machine - v0.0.3](../README.md) / TransitionConsistencyValidator

# Class: TransitionConsistencyValidator\<TContext, TState, TEvent\>

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

- [constructor](TransitionConsistencyValidator.md#constructor)

### Methods

- [validate](TransitionConsistencyValidator.md#validate)

## Constructors

### constructor

• **new TransitionConsistencyValidator**\<`TContext`, `TState`, `TEvent`\>(): [`TransitionConsistencyValidator`](TransitionConsistencyValidator.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Returns

[`TransitionConsistencyValidator`](TransitionConsistencyValidator.md)\<`TContext`, `TState`, `TEvent`\>

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

[src/validation/ConsistencyValidator.ts:23](https://github.com/jewel998/state-machine/blob/main/src/validation/ConsistencyValidator.ts#L23)
