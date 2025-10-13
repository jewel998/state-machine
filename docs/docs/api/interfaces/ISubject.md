[@jewel998/state-machine - v0.0.3](../README.md) / ISubject

# Interface: ISubject\<TEvent\>

## Type parameters

| Name |
| :------ |
| `TEvent` |

## Implemented by

- [`Observable`](../classes/Observable.md)

## Table of contents

### Methods

- [subscribe](ISubject.md#subscribe)
- [unsubscribe](ISubject.md#unsubscribe)
- [notify](ISubject.md#notify)

## Methods

### subscribe

▸ **subscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`IObserver`](IObserver.md)\<`TEvent`\> |

#### Returns

`void`

#### Defined in

[src/patterns/Observer.ts:10](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L10)

___

### unsubscribe

▸ **unsubscribe**(`observer`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `observer` | [`IObserver`](IObserver.md)\<`TEvent`\> |

#### Returns

`void`

#### Defined in

[src/patterns/Observer.ts:11](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L11)

___

### notify

▸ **notify**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `TEvent` |

#### Returns

`void`

#### Defined in

[src/patterns/Observer.ts:12](https://github.com/jewel998/state-machine/blob/main/src/patterns/Observer.ts#L12)
