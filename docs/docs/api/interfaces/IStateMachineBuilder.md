[@jewel998/state-machine - v0.0.3](../README.md) / IStateMachineBuilder

# Interface: IStateMachineBuilder\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Implemented by

- [`StateMachineBuilder`](../classes/StateMachineBuilder.md)

## Table of contents

### Methods

- [initialState](IStateMachineBuilder.md#initialstate)
- [state](IStateMachineBuilder.md#state)
- [transition](IStateMachineBuilder.md#transition)
- [guard](IStateMachineBuilder.md#guard)
- [action](IStateMachineBuilder.md#action)
- [onStateEntry](IStateMachineBuilder.md#onstateentry)
- [onStateExit](IStateMachineBuilder.md#onstateexit)
- [withOptions](IStateMachineBuilder.md#withoptions)
- [build](IStateMachineBuilder.md#build)

## Methods

### initialState

▸ **initialState**(`state`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:20](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L20)

___

### state

▸ **state**(`state`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:21](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L21)

___

### transition

▸ **transition**(`from`, `to`, `event`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `TState` |
| `to` | `TState` |
| `event` | `TEvent` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:22](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L22)

___

### guard

▸ **guard**(`condition`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | (`context`: `TContext`) => `boolean` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:23](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L23)

___

### action

▸ **action**(`callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`context`: `TContext`) => `void` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:24](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L24)

___

### onStateEntry

▸ **onStateEntry**(`state`, `callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |
| `callback` | (`context`: `TContext`) => `void` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:25](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L25)

___

### onStateExit

▸ **onStateExit**(`state`, `callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |
| `callback` | (`context`: `TContext`) => `void` |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:26](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L26)

___

### withOptions

▸ **withOptions**(`options`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`StateMachineOptions`](StateMachineOptions.md) |

#### Returns

`this`

#### Defined in

[src/interfaces/StateMachineInterface.ts:27](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L27)

___

### build

▸ **build**(): [`IStateMachine`](IStateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Returns

[`IStateMachine`](IStateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Defined in

[src/interfaces/StateMachineInterface.ts:28](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L28)
