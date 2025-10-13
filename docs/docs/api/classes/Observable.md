[@jewel998/state-machine - v0.0.3](../README.md) / Observable

# Class: Observable\<TEvent\>

Generic Observable implementation using Observer pattern

## Type parameters

| Name |
| :------ |
| `TEvent` |

## Implements

- [`ISubject`](../interfaces/ISubject.md)\<`TEvent`\>

## Table of contents

### Constructors

- [constructor](Observable.md#constructor)

### Methods

- [subscribe](Observable.md#subscribe)
- [unsubscribe](Observable.md#unsubscribe)
- [notify](Observable.md#notify)
- [getObserverCount](Observable.md#getobservercount)
- [clear](Observable.md#clear)

## Constructors

### constructor

• **new Observable**\<`TEvent`\>(): [`Observable`](Observable.md)\<`TEvent`\>

#### Type parameters

| Name |
| :------ |
| `TEvent` |

#### Returns

[`Observable`](Observable.md)\<`TEvent`\>

## Methods

### subscribe

▸ **subscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`IObserver`](../interfaces/IObserver.md)\<`TEvent`\> |

#### Returns

`void`

#### Implementation of

[ISubject](../interfaces/ISubject.md).[subscribe](../interfaces/ISubject.md#subscribe)

#### Defined in

[src/patterns/Observer.ts:21](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L21)

___

### unsubscribe

▸ **unsubscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`IObserver`](../interfaces/IObserver.md)\<`TEvent`\> |

#### Returns

`void`

#### Implementation of

[ISubject](../interfaces/ISubject.md).[unsubscribe](../interfaces/ISubject.md#unsubscribe)

#### Defined in

[src/patterns/Observer.ts:25](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L25)

___

### notify

▸ **notify**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |

#### Returns

`void`

#### Implementation of

[ISubject](../interfaces/ISubject.md).[notify](../interfaces/ISubject.md#notify)

#### Defined in

[src/patterns/Observer.ts:29](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L29)

___

### getObserverCount

▸ **getObserverCount**(): `number`

#### Returns

`number`

#### Defined in

[src/patterns/Observer.ts:40](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L40)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[src/patterns/Observer.ts:44](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L44)
