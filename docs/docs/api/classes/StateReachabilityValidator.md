[@jewel998/state-machine - v0.0.3](../README.md) / StateReachabilityValidator

# Class: StateReachabilityValidator\<TContext, TState, TEvent\>

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

- [constructor](StateReachabilityValidator.md#constructor)

### Methods

- [validate](StateReachabilityValidator.md#validate)

## Constructors

### constructor

• **new StateReachabilityValidator**\<`TContext`, `TState`, `TEvent`\>(): [`StateReachabilityValidator`](StateReachabilityValidator.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Returns

[`StateReachabilityValidator`](StateReachabilityValidator.md)\<`TContext`, `TState`, `TEvent`\>

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

[src/validation/ReachabilityValidator.ts:23](https://github.com/jewel998/state-machine/blob/main/src/validation/ReachabilityValidator.ts#L23)
