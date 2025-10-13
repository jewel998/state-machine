[@jewel998/state-machine - v0.0.3](../README.md) / StateMachine

# Class: StateMachine\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Implements

- [`IStateMachine`](../interfaces/IStateMachine.md)\<`TContext`, `TState`, `TEvent`\>

## Table of contents

### Constructors

- [constructor](StateMachine.md#constructor)

### Methods

- [start](StateMachine.md#start)
- [sendEvent](StateMachine.md#sendevent)
- [sendEventStrict](StateMachine.md#sendeventstrict)
- [getCurrentState](StateMachine.md#getcurrentstate)
- [canTransition](StateMachine.md#cantransition)
- [getAvailableEvents](StateMachine.md#getavailableevents)
- [reset](StateMachine.md#reset)
- [subscribe](StateMachine.md#subscribe)
- [unsubscribe](StateMachine.md#unsubscribe)
- [getHistory](StateMachine.md#gethistory)
- [clearHistory](StateMachine.md#clearhistory)
- [getConfiguration](StateMachine.md#getconfiguration)
- [getStatistics](StateMachine.md#getstatistics)
- [builder](StateMachine.md#builder)

## Constructors

### constructor

• **new StateMachine**\<`TContext`, `TState`, `TEvent`\>(`config`, `options?`): [`StateMachine`](StateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\> |
| `options` | [`StateMachineOptions`](../interfaces/StateMachineOptions.md) |

#### Returns

[`StateMachine`](StateMachine.md)\<`TContext`, `TState`, `TEvent`\>

#### Defined in

[src/core/StateMachine.ts:44](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L44)

## Methods

### start

▸ **start**(): `void`

#### Returns

`void`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[start](../interfaces/IStateMachine.md#start)

#### Defined in

[src/core/StateMachine.ts:73](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L73)

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

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[sendEvent](../interfaces/IStateMachine.md#sendevent)

#### Defined in

[src/core/StateMachine.ts:82](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L82)

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

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[sendEventStrict](../interfaces/IStateMachine.md#sendeventstrict)

#### Defined in

[src/core/StateMachine.ts:100](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L100)

___

### getCurrentState

▸ **getCurrentState**(): `TState`

#### Returns

`TState`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[getCurrentState](../interfaces/IStateMachine.md#getcurrentstate)

#### Defined in

[src/core/StateMachine.ts:127](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L127)

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

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[canTransition](../interfaces/IStateMachine.md#cantransition)

#### Defined in

[src/core/StateMachine.ts:131](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L131)

___

### getAvailableEvents

▸ **getAvailableEvents**(): readonly `TEvent`[]

#### Returns

readonly `TEvent`[]

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[getAvailableEvents](../interfaces/IStateMachine.md#getavailableevents)

#### Defined in

[src/core/StateMachine.ts:135](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L135)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[reset](../interfaces/IStateMachine.md#reset)

#### Defined in

[src/core/StateMachine.ts:139](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L139)

___

### subscribe

▸ **subscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](../interfaces/StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[subscribe](../interfaces/IStateMachine.md#subscribe)

#### Defined in

[src/core/StateMachine.ts:155](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L155)

___

### unsubscribe

▸ **unsubscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](../interfaces/StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[unsubscribe](../interfaces/IStateMachine.md#unsubscribe)

#### Defined in

[src/core/StateMachine.ts:161](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L161)

___

### getHistory

▸ **getHistory**(): readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Returns

readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[getHistory](../interfaces/IStateMachine.md#gethistory)

#### Defined in

[src/core/StateMachine.ts:168](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L168)

___

### clearHistory

▸ **clearHistory**(): `void`

#### Returns

`void`

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[clearHistory](../interfaces/IStateMachine.md#clearhistory)

#### Defined in

[src/core/StateMachine.ts:172](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L172)

___

### getConfiguration

▸ **getConfiguration**(): [`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>

#### Returns

[`StateMachineConfig`](../interfaces/StateMachineConfig.md)\<`TContext`, `TState`, `TEvent`\>

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[getConfiguration](../interfaces/IStateMachine.md#getconfiguration)

#### Defined in

[src/core/StateMachine.ts:177](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L177)

___

### getStatistics

▸ **getStatistics**(): [`StateMachineStatistics`](../interfaces/StateMachineStatistics.md)

#### Returns

[`StateMachineStatistics`](../interfaces/StateMachineStatistics.md)

#### Implementation of

[IStateMachine](../interfaces/IStateMachine.md).[getStatistics](../interfaces/IStateMachine.md#getstatistics)

#### Defined in

[src/core/StateMachine.ts:181](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L181)

___

### builder

▸ **builder**\<`TContext`, `TState`, `TEvent`\>(): [`StateMachineBuilder`](StateMachineBuilder.md)\<`TContext`, `TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Returns

[`StateMachineBuilder`](StateMachineBuilder.md)\<`TContext`, `TState`, `TEvent`\>

#### Defined in

[src/core/StateMachine.ts:279](https://github.com/jewel998/state-machine/blob/main/src/core/StateMachine.ts#L279)
