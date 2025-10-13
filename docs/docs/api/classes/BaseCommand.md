[@jewel998/state-machine - v0.0.3](../README.md) / BaseCommand

# Class: BaseCommand\<TResult\>

Abstract base command class

## Type parameters

| Name | Type |
| :------ | :------ |
| `TResult` | `void` |

## Hierarchy

- **`BaseCommand`**

  ↳ [`CompositeCommand`](CompositeCommand.md)

## Implements

- [`ICommand`](../interfaces/ICommand.md)\<`TResult`\>

## Table of contents

### Constructors

- [constructor](BaseCommand.md#constructor)

### Methods

- [execute](BaseCommand.md#execute)
- [undo](BaseCommand.md#undo)
- [canUndo](BaseCommand.md#canundo)

## Constructors

### constructor

• **new BaseCommand**\<`TResult`\>(): [`BaseCommand`](BaseCommand.md)\<`TResult`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TResult` | `void` |

#### Returns

[`BaseCommand`](BaseCommand.md)\<`TResult`\>

## Methods

### execute

▸ **execute**(): `TResult`

#### Returns

`TResult`

#### Implementation of

[ICommand](../interfaces/ICommand.md).[execute](../interfaces/ICommand.md#execute)

#### Defined in

[src/patterns/Command.ts:79](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L79)

___

### undo

▸ **undo**(): `void`

#### Returns

`void`

#### Implementation of

[ICommand](../interfaces/ICommand.md).[undo](../interfaces/ICommand.md#undo)

#### Defined in

[src/patterns/Command.ts:81](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L81)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ICommand](../interfaces/ICommand.md).[canUndo](../interfaces/ICommand.md#canundo)

#### Defined in

[src/patterns/Command.ts:83](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L83)
