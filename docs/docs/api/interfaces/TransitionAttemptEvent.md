[@jewel998/state-machine - v0.0.3](../README.md) / TransitionAttemptEvent

# Interface: TransitionAttemptEvent\<TState, TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

## Table of contents

### Properties

- [currentState](TransitionAttemptEvent.md#currentstate)
- [event](TransitionAttemptEvent.md#event)
- [context](TransitionAttemptEvent.md#context)
- [timestamp](TransitionAttemptEvent.md#timestamp)
- [success](TransitionAttemptEvent.md#success)
- [error](TransitionAttemptEvent.md#error)

## Properties

### currentState

• `Readonly` **currentState**: `TState`

#### Defined in

[src/interfaces/EventTypes.ts:30](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L30)

___

### event

• `Readonly` **event**: `TEvent`

#### Defined in

[src/interfaces/EventTypes.ts:31](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L31)

___

### context

• `Readonly` **context**: `TContext`

#### Defined in

[src/interfaces/EventTypes.ts:32](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L32)

___

### timestamp

• `Readonly` **timestamp**: `Date`

#### Defined in

[src/interfaces/EventTypes.ts:33](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L33)

___

### success

• `Readonly` **success**: `boolean`

#### Defined in

[src/interfaces/EventTypes.ts:34](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L34)

___

### error

• `Optional` `Readonly` **error**: `Error`

#### Defined in

[src/interfaces/EventTypes.ts:35](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L35)
