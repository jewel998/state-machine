[@jewel998/state-machine - v0.0.3](../README.md) / CommandInvoker

# Class: CommandInvoker

Command invoker with undo functionality

## Implements

- [`ICommandInvoker`](../interfaces/ICommandInvoker.md)

## Table of contents

### Constructors

- [constructor](CommandInvoker.md#constructor)

### Methods

- [executeCommand](CommandInvoker.md#executecommand)
- [undo](CommandInvoker.md#undo)
- [canUndo](CommandInvoker.md#canundo)
- [clearHistory](CommandInvoker.md#clearhistory)
- [getHistorySize](CommandInvoker.md#gethistorysize)

## Constructors

### constructor

• **new CommandInvoker**(`maxHistorySize?`): [`CommandInvoker`](CommandInvoker.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `maxHistorySize` | `number` | `100` |

#### Returns

[`CommandInvoker`](CommandInvoker.md)

#### Defined in

[src/patterns/Command.ts:25](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L25)

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
| `command` | [`ICommand`](../interfaces/ICommand.md)\<`TResult`\> |

#### Returns

`TResult`

#### Implementation of

[ICommandInvoker](../interfaces/ICommandInvoker.md).[executeCommand](../interfaces/ICommandInvoker.md#executecommand)

#### Defined in

[src/patterns/Command.ts:29](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L29)

___

### undo

▸ **undo**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ICommandInvoker](../interfaces/ICommandInvoker.md).[undo](../interfaces/ICommandInvoker.md#undo)

#### Defined in

[src/patterns/Command.ts:45](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L45)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ICommandInvoker](../interfaces/ICommandInvoker.md).[canUndo](../interfaces/ICommandInvoker.md#canundo)

#### Defined in

[src/patterns/Command.ts:60](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L60)

___

### clearHistory

▸ **clearHistory**(): `void`

#### Returns

`void`

#### Implementation of

[ICommandInvoker](../interfaces/ICommandInvoker.md).[clearHistory](../interfaces/ICommandInvoker.md#clearhistory)

#### Defined in

[src/patterns/Command.ts:64](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L64)

___

### getHistorySize

▸ **getHistorySize**(): `number`

#### Returns

`number`

#### Defined in

[src/patterns/Command.ts:68](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L68)
