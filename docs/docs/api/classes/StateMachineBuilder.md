[@jewel998/state-machine - v0.0.3](../README.md) / StateMachineBuilder

# Class: StateMachineBuilder\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Implements

- [`IStateMachineBuilder`](../interfaces/IStateMachineBuilder.md)\<`TContext`, `TState`, `TEvent`\>

## Table of contents

### Constructors

- [constructor](StateMachineBuilder.md#constructor)

### Methods

- [initialState](StateMachineBuilder.md#initialstate)
- [state](StateMachineBuilder.md#state)
- [transition](StateMachineBuilder.md#transition)
- [guard](StateMachineBuilder.md#guard)
- [action](StateMachineBuilder.md#action)
- [onStateEntry](StateMachineBuilder.md#onstateentry)
- [onStateExit](StateMachineBuilder.md#onstateexit)
- [withOptions](StateMachineBuilder.md#withoptions)
- [build](StateMachineBuilder.md#build)

## Constructors

### constructor

• **new StateMachineBuilder**\<`TContext`, `TState`, `TEvent`\>(): [`StateMachineBuilder`](StateMachineBuilder.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Returns

[`StateMachineBuilder`](StateMachineBuilder.md)\<`TContext`, `TState`, `TEvent`\>

## Methods

### initialState

▸ **initialState**(`state`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[initialState](../interfaces/IStateMachineBuilder.md#initialstate)

#### Defined in

[src/core/StateMachineBuilder.ts:39](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L39)

___

### state

▸ **state**(`state`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[state](../interfaces/IStateMachineBuilder.md#state)

#### Defined in

[src/core/StateMachineBuilder.ts:46](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L46)

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

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[transition](../interfaces/IStateMachineBuilder.md#transition)

#### Defined in

[src/core/StateMachineBuilder.ts:52](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L52)

___

### guard

▸ **guard**(`condition`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | [`GuardFunction`](../README.md#guardfunction)\<`TContext`\> |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[guard](../interfaces/IStateMachineBuilder.md#guard)

#### Defined in

[src/core/StateMachineBuilder.ts:73](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L73)

___

### action

▸ **action**(`callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`ActionFunction`](../README.md#actionfunction)\<`TContext`\> |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[action](../interfaces/IStateMachineBuilder.md#action)

#### Defined in

[src/core/StateMachineBuilder.ts:96](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L96)

___

### onStateEntry

▸ **onStateEntry**(`state`, `callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |
| `callback` | [`ActionFunction`](../README.md#actionfunction)\<`TContext`\> |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[onStateEntry](../interfaces/IStateMachineBuilder.md#onstateentry)

#### Defined in

[src/core/StateMachineBuilder.ts:119](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L119)

___

### onStateExit

▸ **onStateExit**(`state`, `callback`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |
| `callback` | [`ActionFunction`](../README.md#actionfunction)\<`TContext`\> |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[onStateExit](../interfaces/IStateMachineBuilder.md#onstateexit)

#### Defined in

[src/core/StateMachineBuilder.ts:130](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L130)

___

### withOptions

▸ **withOptions**(`options`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`StateMachineOptions`](../interfaces/StateMachineOptions.md) |

#### Returns

`this`

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[withOptions](../interfaces/IStateMachineBuilder.md#withoptions)

#### Defined in

[src/core/StateMachineBuilder.ts:141](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L141)

___

### build

▸ **build**(): [`IStateMachine`](../interfaces/IStateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Returns

[`IStateMachine`](../interfaces/IStateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Implementation of

[IStateMachineBuilder](../interfaces/IStateMachineBuilder.md).[build](../interfaces/IStateMachineBuilder.md#build)

#### Defined in

[src/core/StateMachineBuilder.ts:147](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachineBuilder.ts#L147)
