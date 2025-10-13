[@jewel998/state-machine - v0.0.3](../README.md) / StateAction

# Interface: StateAction\<TContext, TState\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](../README.md#contextconstraint) |
| `TState` | extends [`StateIdentifier`](../README.md#stateidentifier) |

## Table of contents

### Properties

- [state](StateAction.md#state)
- [action](StateAction.md#action)
- [metadata](StateAction.md#metadata)

## Properties

### state

• `Readonly` **state**: `TState`

#### Defined in

[src/interfaces/ConfigurationTypes.ts:46](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L46)

___

### action

• `Readonly` **action**: [`ActionFunction`](../README.md#actionfunction)\<`TContext`\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:47](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L47)

___

### metadata

• `Optional` `Readonly` **metadata**: `Readonly`\<`Record`\<`string`, `string` \| `number` \| `boolean`\>\>

#### Defined in

[src/interfaces/ConfigurationTypes.ts:48](https://github.com/jewel998/state-machine/blob/main/src/interfaces/ConfigurationTypes.ts#L48)
