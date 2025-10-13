[@jewel998/state-machine - v0.0.3](../README.md) / StateMachineStatistics

# Interface: StateMachineStatistics

## Table of contents

### Properties

- [totalTransitions](StateMachineStatistics.md#totaltransitions)
- [successfulTransitions](StateMachineStatistics.md#successfultransitions)
- [failedTransitions](StateMachineStatistics.md#failedtransitions)
- [stateVisitCounts](StateMachineStatistics.md#statevisitcounts)
- [eventCounts](StateMachineStatistics.md#eventcounts)
- [averageTransitionTime](StateMachineStatistics.md#averagetransitiontime)
- [createdAt](StateMachineStatistics.md#createdat)
- [lastTransitionAt](StateMachineStatistics.md#lasttransitionat)

## Properties

### totalTransitions

• `Readonly` **totalTransitions**: `number`

#### Defined in

[src/interfaces/StatisticsTypes.ts:22](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L22)

___

### successfulTransitions

• `Readonly` **successfulTransitions**: `number`

#### Defined in

[src/interfaces/StatisticsTypes.ts:23](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L23)

___

### failedTransitions

• `Readonly` **failedTransitions**: `number`

#### Defined in

[src/interfaces/StatisticsTypes.ts:24](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L24)

___

### stateVisitCounts

• `Readonly` **stateVisitCounts**: `Readonly`\<`Record`\<`string`, `number`\>\>

#### Defined in

[src/interfaces/StatisticsTypes.ts:25](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L25)

___

### eventCounts

• `Readonly` **eventCounts**: `Readonly`\<`Record`\<`string`, `number`\>\>

#### Defined in

[src/interfaces/StatisticsTypes.ts:26](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L26)

___

### averageTransitionTime

• `Readonly` **averageTransitionTime**: `number`

#### Defined in

[src/interfaces/StatisticsTypes.ts:27](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L27)

___

### createdAt

• `Readonly` **createdAt**: `Date`

#### Defined in

[src/interfaces/StatisticsTypes.ts:28](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L28)

___

### lastTransitionAt

• `Optional` `Readonly` **lastTransitionAt**: `Date`

#### Defined in

[src/interfaces/StatisticsTypes.ts:29](https://github.com/jewel998/state-machine/blob/main/src/interfaces/StatisticsTypes.ts#L29)
