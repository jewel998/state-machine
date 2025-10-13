[@jewel998/state-machine - v0.0.3](../README.md) / ICommandInvoker

# Interface: ICommandInvoker

## Implemented by

- [`CommandInvoker`](../classes/CommandInvoker.md)

## Table of contents

### Methods

- [executeCommand](ICommandInvoker.md#executecommand)
- [undo](ICommandInvoker.md#undo)
- [canUndo](ICommandInvoker.md#canundo)
- [clearHistory](ICommandInvoker.md#clearhistory)

## Methods

### executeCommand

▸ **executeCommand**\<`TResult`\>(`command`): `TResult`

#### Type parameters

| Name |
| :------ |
| `TResult` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `command` | [`ICommand`](ICommand.md)\<`TResult`\> |

#### Returns

`TResult`

#### Defined in

[src/patterns/Command.ts:12](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L12)

___

### undo

▸ **undo**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/patterns/Command.ts:13](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L13)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/patterns/Command.ts:14](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L14)

___

### clearHistory

▸ **clearHistory**(): `void`

#### Returns

`void`

#### Defined in

[src/patterns/Command.ts:15](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L15)
