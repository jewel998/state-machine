[@jewel998/state-machine - v0.0.3](../README.md) / CompositeCommand

# Class: CompositeCommand

Composite command for executing multiple commands as one

## Hierarchy

- [`BaseCommand`](BaseCommand.md)\<`void`\>

  ↳ **`CompositeCommand`**

## Table of contents

### Constructors

- [constructor](CompositeCommand.md#constructor)

### Methods

- [execute](CompositeCommand.md#execute)
- [undo](CompositeCommand.md#undo)
- [canUndo](CompositeCommand.md#canundo)

## Constructors

### constructor

• **new CompositeCommand**(`commands`): [`CompositeCommand`](CompositeCommand.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `commands` | readonly [`ICommand`](../interfaces/ICommand.md)\<`unknown`\>[] |

#### Returns

[`CompositeCommand`](CompositeCommand.md)

#### Overrides

[BaseCommand](BaseCommand.md).[constructor](BaseCommand.md#constructor)

#### Defined in

[src/patterns/Command.ts:94](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L94)

## Methods

### execute

▸ **execute**(): `void`

#### Returns

`void`

#### Overrides

[BaseCommand](BaseCommand.md).[execute](BaseCommand.md#execute)

#### Defined in

[src/patterns/Command.ts:99](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L99)

___

### undo

▸ **undo**(): `void`

#### Returns

`void`

#### Overrides

[BaseCommand](BaseCommand.md).[undo](BaseCommand.md#undo)

#### Defined in

[src/patterns/Command.ts:104](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L104)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseCommand](BaseCommand.md).[canUndo](BaseCommand.md#canundo)

#### Defined in

[src/patterns/Command.ts:117](https://github.com/jewel998/state-machine/blob/main/src/patterns/Command.ts#L117)
