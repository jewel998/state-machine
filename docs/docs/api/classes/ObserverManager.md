[@jewel998/state-machine - v0.0.3](../README.md) / ObserverManager

# Class: ObserverManager\<TState, TEvent, TContext\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

## Table of contents

### Constructors

- [constructor](ObserverManager.md#constructor)

### Methods

- [subscribe](ObserverManager.md#subscribe)
- [unsubscribe](ObserverManager.md#unsubscribe)
- [notifyStateChange](ObserverManager.md#notifystatechange)
- [notifyTransitionAttempt](ObserverManager.md#notifytransitionattempt)
- [getObserverCount](ObserverManager.md#getobservercount)
- [clear](ObserverManager.md#clear)

## Constructors

### constructor

• **new ObserverManager**\<`TState`, `TEvent`, `TContext`\>(`enabled?`): [`ObserverManager`](ObserverManager.md)\<`TState`, `TEvent`, `TContext`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `enabled` | `boolean` | `true` |

#### Returns

[`ObserverManager`](ObserverManager.md)\<`TState`, `TEvent`, `TContext`\>

#### Defined in

[src/observers/ObserverManager.ts:28](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L28)

## Methods

### subscribe

▸ **subscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](../interfaces/StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/observers/ObserverManager.ts:38](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L38)

___

### unsubscribe

▸ **unsubscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`StateChangeObserver`](../interfaces/StateChangeObserver.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/observers/ObserverManager.ts:56](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L56)

___

### notifyStateChange

▸ **notifyStateChange**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`StateChangeEvent`](../interfaces/StateChangeEvent.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/observers/ObserverManager.ts:74](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L74)

___

### notifyTransitionAttempt

▸ **notifyTransitionAttempt**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`TransitionAttemptEvent`](../interfaces/TransitionAttemptEvent.md)\<`TState`, `TEvent`, `TContext`\> |

#### Returns

`void`

#### Defined in

[src/observers/ObserverManager.ts:82](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L82)

___

### getObserverCount

▸ **getObserverCount**(): `number`

#### Returns

`number`

#### Defined in

[src/observers/ObserverManager.ts:90](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L90)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[src/observers/ObserverManager.ts:97](https://github.com/jewel998/state-machine/blob/main/src/observers/ObserverManager.ts#L97)
