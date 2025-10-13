[@jewel998/state-machine - v0.0.3](../README.md) / StateChangeEvent

# Interface: StateChangeEvent\<TState, TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

## Table of contents

### Properties

- [fromState](StateChangeEvent.md#fromstate)
- [toState](StateChangeEvent.md#tostate)
- [event](StateChangeEvent.md#event)
- [context](StateChangeEvent.md#context)
- [timestamp](StateChangeEvent.md#timestamp)
- [transitionId](StateChangeEvent.md#transitionid)

## Properties

### fromState

• `Readonly` **fromState**: `TState`

#### Defined in

[src/interfaces/EventTypes.ts:17](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L17)

___

### toState

• `Readonly` **toState**: `TState`

#### Defined in

[src/interfaces/EventTypes.ts:18](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L18)

___

### event

• `Readonly` **event**: `TEvent`

#### Defined in

[src/interfaces/EventTypes.ts:19](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L19)

___

### context

• `Readonly` **context**: `TContext`

#### Defined in

[src/interfaces/EventTypes.ts:20](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L20)

___

### timestamp

• `Readonly` **timestamp**: `Date`

#### Defined in

[src/interfaces/EventTypes.ts:21](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L21)

___

### transitionId

• `Readonly` **transitionId**: `string`

#### Defined in

[src/interfaces/EventTypes.ts:22](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L22)
