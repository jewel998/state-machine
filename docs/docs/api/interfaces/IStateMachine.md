[@jewel998/state-machine - v0.0.3](../README.md) / IStateMachine

# Interface: IStateMachine\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Implemented by

- [`StateMachine`](../classes/StateMachine.md)

## Table of contents

### Methods

- [start](IStateMachine.md#start)
- [sendEvent](IStateMachine.md#sendevent)
- [sendEventStrict](IStateMachine.md#sendeventstrict)
- [getCurrentState](IStateMachine.md#getcurrentstate)
- [canTransition](IStateMachine.md#cantransition)
- [getAvailableEvents](IStateMachine.md#getavailableevents)
- [reset](IStateMachine.md#reset)
- [subscribe](IStateMachine.md#subscribe)
- [unsubscribe](IStateMachine.md#unsubscribe)
- [getHistory](IStateMachine.md#gethistory)
- [clearHistory](IStateMachine.md#clearhistory)
- [getConfiguration](IStateMachine.md#getconfiguration)
- [getStatistics](IStateMachine.md#getstatistics)

## Methods

### start

▸ **start**(): `void`

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:38](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L38)

___

### sendEvent

▸ **sendEvent**(`event`, `context`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |
| `context` | `TContext` |

#### Returns

`boolean`

#### Defined in

[src/interfaces/StateMachineInterface.ts:39](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L39)

___

### sendEventStrict

▸ **sendEventStrict**(`event`, `context`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |
| `context` | `TContext` |

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:40](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L40)

___

### getCurrentState

▸ **getCurrentState**(): `TState`

#### Returns

`TState`

#### Defined in

[src/interfaces/StateMachineInterface.ts:41](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L41)

___

### canTransition

▸ **canTransition**(`event`, `context`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |
| `context` | `TContext` |

#### Returns

`boolean`

#### Defined in

[src/interfaces/StateMachineInterface.ts:42](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L42)

___

### getAvailableEvents

▸ **getAvailableEvents**(): readonly `TEvent`[]

#### Returns

readonly `TEvent`[]

#### Defined in

[src/interfaces/StateMachineInterface.ts:43](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L43)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:44](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L44)

___

### subscribe

▸ **subscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:47](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L47)

___

### unsubscribe

▸ **unsubscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:48](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L48)

___

### getHistory

▸ **getHistory**(): readonly [`StateChangeEvent`](StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Returns

readonly [`StateChangeEvent`](StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Defined in

[src/interfaces/StateMachineInterface.ts:51](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L51)

___

### clearHistory

▸ **clearHistory**(): `void`

#### Returns

`void`

#### Defined in

[src/interfaces/StateMachineInterface.ts:52](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L52)

___

### getConfiguration

▸ **getConfiguration**(): [`StateMachineConfig`](StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>

#### Returns

[`StateMachineConfig`](StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>

#### Defined in

[src/interfaces/StateMachineInterface.ts:55](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L55)

___

### getStatistics

▸ **getStatistics**(): [`StateMachineStatistics`](StateMachineStatistics.md)

#### Returns

[`StateMachineStatistics`](StateMachineStatistics.md)

#### Defined in

[src/interfaces/StateMachineInterface.ts:56](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StateMachineInterface.ts#L56)
