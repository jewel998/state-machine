[@jewel998/state-machine - v0.0.3](../README.md) / StateMachineConfig

# Interface: StateMachineConfig\<TContext, TState, TEvent\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |
| `TEvent` | extends [`EventIdentifier`](../README.md#eventidentifier) |

## Table of contents

### Properties

- [initialState](StateMachineConfig.md#initialstate)
- [states](StateMachineConfig.md#states)
- [transitions](StateMachineConfig.md#transitions)
- [entryActions](StateMachineConfig.md#entryactions)
- [exitActions](StateMachineConfig.md#exitactions)
- [metadata](StateMachineConfig.md#metadata)

## Properties

### initialState

• `Readonly` **initialState**: `TState`

#### Defined in

[src/interfaces/ConfigurationTypes.ts:21](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L21)

___

### states

• `Readonly` **states**: [`NonEmptyArray`](../README.md#nonemptyarray)\<`TState`\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:22](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L22)

___

### transitions

• `Readonly` **transitions**: readonly [`Transition`](Transition.md)\<`TContext`, `TState`, `TEvent`\>[]

#### Defined in

[src/interfaces/ConfigurationTypes.ts:23](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L23)

___

### entryActions

• `Optional` `Readonly` **entryActions**: readonly [`StateAction`](StateAction.md)\<`TContext`, `TState`\>[]

#### Defined in

[src/interfaces/ConfigurationTypes.ts:24](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L24)

___

### exitActions

• `Optional` `Readonly` **exitActions**: readonly [`StateAction`](StateAction.md)\<`TContext`, `TState`\>[]

#### Defined in

[src/interfaces/ConfigurationTypes.ts:25](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L25)

___

### metadata

• `Optional` `Readonly` **metadata**: `Readonly`\<`Record`\<`string`, `string` \| `number` \| `boolean`\>\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:26](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L26)
