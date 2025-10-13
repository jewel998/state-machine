[@jewel998/state-machine - v0.0.3](../README.md) / Transition

# Interface: Transition\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Table of contents

### Properties

- [from](Transition.md#from)
- [to](Transition.md#to)
- [event](Transition.md#event)
- [guard](Transition.md#guard)
- [action](Transition.md#action)
- [metadata](Transition.md#metadata)

## Properties

### from

• `Readonly` **from**: `TState`

#### Defined in

[src/interfaces/ConfigurationTypes.ts:34](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L34)

___

### to

• `Readonly` **to**: `TState`

#### Defined in

[src/interfaces/ConfigurationTypes.ts:35](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L35)

___

### event

• `Readonly` **event**: `TEvent`

#### Defined in

[src/interfaces/ConfigurationTypes.ts:36](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L36)

___

### guard

• `Optional` `Readonly` **guard**: [`GuardFunction`](../README.md#guardfunction)\<`TContext`\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:37](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L37)

___

### action

• `Optional` `Readonly` **action**: [`ActionFunction`](../README.md#actionfunction)\<`TContext`\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:38](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L38)

___

### metadata

• `Optional` `Readonly` **metadata**: `Readonly`\<`Record`\<`string`, `string` \| `number` \| `boolean`\>\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:39](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L39)
