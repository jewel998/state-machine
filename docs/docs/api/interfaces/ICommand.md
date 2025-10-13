[@jewel998/state-machine - v0.0.3](../README.md) / ICommand

# Interface: ICommand\<TResult\>

Command pattern for state machine actions and transitions

## Type parameters

| Name | Type |
| :------ | :------ |
| `TResult` | `void` |

## Implemented by

- [`BaseCommand`](../classes/BaseCommand.md)

## Table of contents

### Methods

- [execute](ICommand.md#execute)
- [undo](ICommand.md#undo)
- [canUndo](ICommand.md#canundo)

## Methods

### execute

▸ **execute**(): `TResult`

#### Returns

`TResult`

#### Defined in

[src/patterns/Command.ts:6](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L6)

___

### undo

▸ **undo**(): `void`

#### Returns

`void`

#### Defined in

[src/patterns/Command.ts:7](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L7)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/patterns/Command.ts:8](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L8)
