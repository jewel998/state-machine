[@jewel998/state-machine - v0.0.3](../README.md) / StateChangeObserver

# Interface: StateChangeObserver\<TState, TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

## Table of contents

### Methods

- [onStateChange](StateChangeObserver.md#onstatechange)
- [onTransitionAttempt](StateChangeObserver.md#ontransitionattempt)

## Methods

### onStateChange

▸ **onStateChange**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`StateChangeEvent`](StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/interfaces/EventTypes.ts:44](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L44)

___

### onTransitionAttempt

▸ **onTransitionAttempt**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`TransitionAttemptEvent`](TransitionAttemptEvent.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/interfaces/EventTypes.ts:45](https://github.com/jewel998/state-machine/blob/main/src/interfaces/EventTypes.ts#L45)
