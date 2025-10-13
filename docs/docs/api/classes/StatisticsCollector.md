[@jewel998/state-machine - v0.0.3](../README.md) / StatisticsCollector

# Class: StatisticsCollector\<TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Table of contents

### Constructors

- [constructor](StatisticsCollector.md#constructor)

### Methods

- [recordSuccessfulTransition](StatisticsCollector.md#recordsuccessfultransition)
- [recordFailedTransition](StatisticsCollector.md#recordfailedtransition)
- [getStatistics](StatisticsCollector.md#getstatistics)
- [reset](StatisticsCollector.md#reset)

## Constructors

### constructor

• **new StatisticsCollector**\<`TState`, `TEvent`\>(): [`StatisticsCollector`](StatisticsCollector.md)\<`TState`, `TEvent`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

#### Returns

[`StatisticsCollector`](StatisticsCollector.md)\<`TState`, `TEvent`\>

#### Defined in

[src/statistics/StatisticsCollector.ts:26](https://github.com/jewel998/state-machine/blob/main/src/statistics/StatisticsCollector.ts#L26)

## Methods

### recordSuccessfulTransition

▸ **recordSuccessfulTransition**(`event`, `toState`, `duration`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |
| `toState` | `TState` |
| `duration` | `number` |

#### Returns

`void`

#### Defined in

[src/statistics/StatisticsCollector.ts:39](https://github.com/jewel998/state-machine/blob/main/src/statistics/StatisticsCollector.ts#L39)

___

### recordFailedTransition

▸ **recordFailedTransition**(): `void`

#### Returns

`void`

#### Defined in

[src/statistics/StatisticsCollector.ts:53](https://github.com/jewel998/state-machine/blob/main/src/statistics/StatisticsCollector.ts#L53)

___

### getStatistics

▸ **getStatistics**(): [`StateMachineStatistics`](../interfaces/StateMachineStatistics.md)

#### Returns

[`StateMachineStatistics`](../interfaces/StateMachineStatistics.md)

#### Defined in

[src/statistics/StatisticsCollector.ts:58](https://github.com/jewel998/state-machine/blob/main/src/statistics/StatisticsCollector.ts#L58)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Defined in

[src/statistics/StatisticsCollector.ts:87](https://github.com/jewel998/state-machine/blob/main/src/statistics/StatisticsCollector.ts#L87)
