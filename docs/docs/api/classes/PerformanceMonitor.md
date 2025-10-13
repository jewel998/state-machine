[@jewel998/state-machine - v0.0.3](../README.md) / PerformanceMonitor

# Class: PerformanceMonitor

## Table of contents

### Constructors

- [constructor](PerformanceMonitor.md#constructor)

### Methods

- [startMeasurement](PerformanceMonitor.md#startmeasurement)
- [endMeasurement](PerformanceMonitor.md#endmeasurement)
- [measureSync](PerformanceMonitor.md#measuresync)
- [measureAsync](PerformanceMonitor.md#measureasync)

## Constructors

### constructor

• **new PerformanceMonitor**(): [`PerformanceMonitor`](PerformanceMonitor.md)

#### Returns

[`PerformanceMonitor`](PerformanceMonitor.md)

## Methods

### startMeasurement

▸ **startMeasurement**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`void`

#### Defined in

[src/utils/PerformanceMonitor.ts:14](https://github.com/jewel998/state-machine/blob/main/src/utils/PerformanceMonitor.ts#L14)

___

### endMeasurement

▸ **endMeasurement**(`id`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`number`

#### Defined in

[src/utils/PerformanceMonitor.ts:18](https://github.com/jewel998/state-machine/blob/main/src/utils/PerformanceMonitor.ts#L18)

___

### measureSync

▸ **measureSync**\<`T`\>(`fn`): `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `T` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `result` | `T` |
| `metrics` | [`PerformanceMetrics`](../interfaces/PerformanceMetrics.md) |

#### Defined in

[src/utils/PerformanceMonitor.ts:31](https://github.com/jewel998/state-machine/blob/main/src/utils/PerformanceMonitor.ts#L31)

___

### measureAsync

▸ **measureAsync**\<`T`\>(`fn`): `Promise`\<\{ `result`: `T` ; `metrics`: [`PerformanceMetrics`](../interfaces/PerformanceMetrics.md)  }\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => `Promise`\<`T`\> |

#### Returns

`Promise`\<\{ `result`: `T` ; `metrics`: [`PerformanceMetrics`](../interfaces/PerformanceMetrics.md)  }\>

#### Defined in

[src/utils/PerformanceMonitor.ts:62](https://github.com/jewel998/state-machine/blob/main/src/utils/PerformanceMonitor.ts#L62)
