@jewel998/state-machine

# @jewel998/state-machine - v0.0.3

## Table of contents

### Enumerations

- [LogLevel](enums/LogLevel.md)

### Classes

- [StateMachine](classes/StateMachine.md)
- [StateMachineBuilder](classes/StateMachineBuilder.md)
- [StateMachineError](classes/StateMachineError.md)
- [InvalidStateError](classes/InvalidStateError.md)
- [InvalidTransitionError](classes/InvalidTransitionError.md)
- [GuardConditionError](classes/GuardConditionError.md)
- [StateMachineConfigurationError](classes/StateMachineConfigurationError.md)
- [ActionExecutionError](classes/ActionExecutionError.md)
- [HistoryManager](classes/HistoryManager.md)
- [Logger](classes/Logger.md)
- [ObserverManager](classes/ObserverManager.md)
- [CommandInvoker](classes/CommandInvoker.md)
- [BaseCommand](classes/BaseCommand.md)
- [CompositeCommand](classes/CompositeCommand.md)
- [Observable](classes/Observable.md)
- [ValidationResultImpl](classes/ValidationResultImpl.md)
- [ValidationContext](classes/ValidationContext.md)
- [StatisticsCollector](classes/StatisticsCollector.md)
- [IdGenerator](classes/IdGenerator.md)
- [PerformanceMonitor](classes/PerformanceMonitor.md)
- [BasicConfigurationValidator](classes/BasicConfigurationValidator.md)
- [ConfigurationValidator](classes/ConfigurationValidator.md)
- [TransitionConsistencyValidator](classes/TransitionConsistencyValidator.md)
- [StateReachabilityValidator](classes/StateReachabilityValidator.md)

### Interfaces

- [StateMachineConfig](interfaces/StateMachineConfig.md)
- [Transition](interfaces/Transition.md)
- [StateAction](interfaces/StateAction.md)
- [StateMachineOptions](interfaces/StateMachineOptions.md)
- [StateChangeEvent](interfaces/StateChangeEvent.md)
- [TransitionAttemptEvent](interfaces/TransitionAttemptEvent.md)
- [StateChangeObserver](interfaces/StateChangeObserver.md)
- [IStateMachineBuilder](interfaces/IStateMachineBuilder.md)
- [IStateMachine](interfaces/IStateMachine.md)
- [ValidationIssue](interfaces/ValidationIssue.md)
- [ConfigurationValidationResult](interfaces/ConfigurationValidationResult.md)
- [StateMachineStatistics](interfaces/StateMachineStatistics.md)
- [ICommand](interfaces/ICommand.md)
- [ICommandInvoker](interfaces/ICommandInvoker.md)
- [IObserver](interfaces/IObserver.md)
- [ISubject](interfaces/ISubject.md)
- [IValidationStrategy](interfaces/IValidationStrategy.md)
- [ValidationResult](interfaces/ValidationResult.md)
- [PerformanceMetrics](interfaces/PerformanceMetrics.md)

### Type Aliases

- [StateIdentifier](README.md#stateidentifier)
- [EventIdentifier](README.md#eventidentifier)
- [NonEmptyArray](README.md#nonemptyarray)
- [ReadonlyRecord](README.md#readonlyrecord)
- [ContextConstraint](README.md#contextconstraint)
- [GuardFunction](README.md#guardfunction)
- [ActionFunction](README.md#actionfunction)

### Variables

- [logger](README.md#logger)

## Type Aliases

### StateIdentifier

Ƭ **StateIdentifier**: `string` \| `number` \| `symbol`

Base type definitions for the state machine library

#### Defined in

[src/interfaces/BaseTypes.ts:6](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L6)

___

### EventIdentifier

Ƭ **EventIdentifier**: `string` \| `number` \| `symbol`

#### Defined in

[src/interfaces/BaseTypes.ts:7](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L7)

___

### NonEmptyArray

Ƭ **NonEmptyArray**\<`T`\>: [`T`, ...T[]]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[src/interfaces/BaseTypes.ts:10](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L10)

___

### ReadonlyRecord

Ƭ **ReadonlyRecord**\<`K`, `V`\>: `Readonly`\<`Record`\<`K`, `V`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `PropertyKey` |
| `V` | `V` |

#### Defined in

[src/interfaces/BaseTypes.ts:11](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L11)

___

### ContextConstraint

Ƭ **ContextConstraint**: `Record`\<`string`, `unknown`\>

#### Defined in

[src/interfaces/BaseTypes.ts:14](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L14)

___

### GuardFunction

Ƭ **GuardFunction**\<`TContext`\>: (`context`: `TContext`) => `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](README.md#contextconstraint) |

#### Type declaration

▸ (`context`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `TContext` |

##### Returns

`boolean`

#### Defined in

[src/interfaces/BaseTypes.ts:17](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L17)

___

### ActionFunction

Ƭ **ActionFunction**\<`TContext`\>: (`context`: `TContext`) => `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TContext` | extends [`ContextConstraint`](README.md#contextconstraint) |

#### Type declaration

▸ (`context`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `TContext` |

##### Returns

`void`

#### Defined in

[src/interfaces/BaseTypes.ts:21](https://github.com/jewel998/state-machine/blob/main/src/interfaces/BaseTypes.ts#L21)

## Variables

### logger

• `Const` **logger**: [`Logger`](classes/Logger.md)

#### Defined in

[src/logger.ts:136](https://github.com/jewel998/state-machine/blob/main/src/logger.ts#L136)
