[@jewel998/state-machine - v0.0.3](../README.md) / HistoryManager

# Class: HistoryManager\<TState, TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

## Table of contents

### Constructors

- [constructor](HistoryManager.md#constructor)

### Methods

- [addEvent](HistoryManager.md#addevent)
- [getHistory](HistoryManager.md#gethistory)
- [getRecentHistory](HistoryManager.md#getrecenthistory)
- [clear](HistoryManager.md#clear)
- [getHistorySize](HistoryManager.md#gethistorysize)
- [findEventsByState](HistoryManager.md#findeventsbystate)
- [findEventsByEvent](HistoryManager.md#findeventsbyevent)
- [getLastEvent](HistoryManager.md#getlastevent)

## Constructors

### constructor

• **new HistoryManager**\<`TState`, `TEvent`, `TContext`\>(`maxHistorySize?`): [`HistoryManager`](HistoryManager.md)\<`TState`, `TEvent`, `TContext`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `maxHistorySize` | `number` | `1000` |

#### Returns

[`HistoryManager`](HistoryManager.md)\<`TState`, `TEvent`, `TContext`\>

#### Defined in

[src/history/HistoryManager.ts:20](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L20)

## Methods

### addEvent

▸ **addEvent**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/history/HistoryManager.ts:24](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L24)

___

### getHistory

▸ **getHistory**(): readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Returns

readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Defined in

[src/history/HistoryManager.ts:33](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L33)

___

### getRecentHistory

▸ **getRecentHistory**(`count`): readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `count` | `number` |

#### Returns

readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Defined in

[src/history/HistoryManager.ts:37](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L37)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[src/history/HistoryManager.ts:43](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L43)

___

### getHistorySize

▸ **getHistorySize**(): `number`

#### Returns

`number`

#### Defined in

[src/history/HistoryManager.ts:47](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L47)

___

### findEventsByState

▸ **findEventsByState**(`state`): readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `TState` |

#### Returns

readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Defined in

[src/history/HistoryManager.ts:51](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L51)

___

### findEventsByEvent

▸ **findEventsByEvent**(`eventType`): readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventType` | `TEvent` |

#### Returns

readonly [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>[]

#### Defined in

[src/history/HistoryManager.ts:59](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L59)

___

### getLastEvent

▸ **getLastEvent**(): `undefined` \| [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>

#### Returns

`undefined` \| [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\>

#### Defined in

[src/history/HistoryManager.ts:65](https://github.com/jewel998/state-machine/blob/main/src/history/HistoryManager.ts#L65)
