import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/state-machine/__docusaurus/debug',
    component: ComponentCreator('/state-machine/__docusaurus/debug', 'c5a'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/config',
    component: ComponentCreator('/state-machine/__docusaurus/debug/config', 'a48'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/content',
    component: ComponentCreator('/state-machine/__docusaurus/debug/content', 'a43'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/globalData',
    component: ComponentCreator('/state-machine/__docusaurus/debug/globalData', '95a'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/metadata',
    component: ComponentCreator('/state-machine/__docusaurus/debug/metadata', '9fa'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/registry',
    component: ComponentCreator('/state-machine/__docusaurus/debug/registry', '08f'),
    exact: true
  },
  {
    path: '/state-machine/__docusaurus/debug/routes',
    component: ComponentCreator('/state-machine/__docusaurus/debug/routes', 'f15'),
    exact: true
  },
  {
    path: '/state-machine/search',
    component: ComponentCreator('/state-machine/search', '3fc'),
    exact: true
  },
  {
    path: '/state-machine/',
    component: ComponentCreator('/state-machine/', 'bf4'),
    routes: [
      {
        path: '/state-machine/',
        component: ComponentCreator('/state-machine/', '599'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/state-machine/api',
        component: ComponentCreator('/state-machine/api', '18f'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/ActionExecutionError',
        component: ComponentCreator('/state-machine/api/classes/ActionExecutionError', '223'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/BaseCommand',
        component: ComponentCreator('/state-machine/api/classes/BaseCommand', '8f5'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/BasicConfigurationValidator',
        component: ComponentCreator('/state-machine/api/classes/BasicConfigurationValidator', '0f1'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/CommandInvoker',
        component: ComponentCreator('/state-machine/api/classes/CommandInvoker', '0db'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/CompositeCommand',
        component: ComponentCreator('/state-machine/api/classes/CompositeCommand', '3d5'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/ConfigurationValidator',
        component: ComponentCreator('/state-machine/api/classes/ConfigurationValidator', 'd8a'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/GuardConditionError',
        component: ComponentCreator('/state-machine/api/classes/GuardConditionError', 'ae5'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/HistoryManager',
        component: ComponentCreator('/state-machine/api/classes/HistoryManager', '604'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/IdGenerator',
        component: ComponentCreator('/state-machine/api/classes/IdGenerator', 'cc2'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/InvalidStateError',
        component: ComponentCreator('/state-machine/api/classes/InvalidStateError', '687'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/InvalidTransitionError',
        component: ComponentCreator('/state-machine/api/classes/InvalidTransitionError', 'ba2'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/Logger',
        component: ComponentCreator('/state-machine/api/classes/Logger', 'c7f'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/Observable',
        component: ComponentCreator('/state-machine/api/classes/Observable', 'e1c'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/ObserverManager',
        component: ComponentCreator('/state-machine/api/classes/ObserverManager', 'c4b'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/PerformanceMonitor',
        component: ComponentCreator('/state-machine/api/classes/PerformanceMonitor', '89e'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StateMachine',
        component: ComponentCreator('/state-machine/api/classes/StateMachine', 'dfc'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StateMachineBuilder',
        component: ComponentCreator('/state-machine/api/classes/StateMachineBuilder', '54d'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StateMachineConfigurationError',
        component: ComponentCreator('/state-machine/api/classes/StateMachineConfigurationError', 'e6c'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StateMachineError',
        component: ComponentCreator('/state-machine/api/classes/StateMachineError', '964'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StateReachabilityValidator',
        component: ComponentCreator('/state-machine/api/classes/StateReachabilityValidator', '670'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/StatisticsCollector',
        component: ComponentCreator('/state-machine/api/classes/StatisticsCollector', '308'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/TransitionConsistencyValidator',
        component: ComponentCreator('/state-machine/api/classes/TransitionConsistencyValidator', 'ce5'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/ValidationContext',
        component: ComponentCreator('/state-machine/api/classes/ValidationContext', '456'),
        exact: true
      },
      {
        path: '/state-machine/api/classes/ValidationResultImpl',
        component: ComponentCreator('/state-machine/api/classes/ValidationResultImpl', '933'),
        exact: true
      },
      {
        path: '/state-machine/api/enums/LogLevel',
        component: ComponentCreator('/state-machine/api/enums/LogLevel', '221'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ConfigurationValidationResult',
        component: ComponentCreator('/state-machine/api/interfaces/ConfigurationValidationResult', '086'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ICommand',
        component: ComponentCreator('/state-machine/api/interfaces/ICommand', 'b20'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ICommandInvoker',
        component: ComponentCreator('/state-machine/api/interfaces/ICommandInvoker', '7f2'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/IObserver',
        component: ComponentCreator('/state-machine/api/interfaces/IObserver', '517'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/IStateMachine',
        component: ComponentCreator('/state-machine/api/interfaces/IStateMachine', '935'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/IStateMachineBuilder',
        component: ComponentCreator('/state-machine/api/interfaces/IStateMachineBuilder', '8ff'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ISubject',
        component: ComponentCreator('/state-machine/api/interfaces/ISubject', 'd59'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/IValidationStrategy',
        component: ComponentCreator('/state-machine/api/interfaces/IValidationStrategy', '6f8'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/PerformanceMetrics',
        component: ComponentCreator('/state-machine/api/interfaces/PerformanceMetrics', '891'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateAction',
        component: ComponentCreator('/state-machine/api/interfaces/StateAction', '7ef'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateChangeEvent',
        component: ComponentCreator('/state-machine/api/interfaces/StateChangeEvent', '6a7'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateChangeObserver',
        component: ComponentCreator('/state-machine/api/interfaces/StateChangeObserver', 'c34'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateMachineConfig',
        component: ComponentCreator('/state-machine/api/interfaces/StateMachineConfig', 'e6f'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateMachineOptions',
        component: ComponentCreator('/state-machine/api/interfaces/StateMachineOptions', '335'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/StateMachineStatistics',
        component: ComponentCreator('/state-machine/api/interfaces/StateMachineStatistics', '8a5'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/Transition',
        component: ComponentCreator('/state-machine/api/interfaces/Transition', 'd35'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/TransitionAttemptEvent',
        component: ComponentCreator('/state-machine/api/interfaces/TransitionAttemptEvent', 'ca9'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ValidationIssue',
        component: ComponentCreator('/state-machine/api/interfaces/ValidationIssue', '932'),
        exact: true
      },
      {
        path: '/state-machine/api/interfaces/ValidationResult',
        component: ComponentCreator('/state-machine/api/interfaces/ValidationResult', '965'),
        exact: true
      },
      {
        path: '/state-machine/getting-started/basic-concepts',
        component: ComponentCreator('/state-machine/getting-started/basic-concepts', '0f9'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/state-machine/getting-started/installation',
        component: ComponentCreator('/state-machine/getting-started/installation', '298'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/state-machine/getting-started/quick-start',
        component: ComponentCreator('/state-machine/getting-started/quick-start', '2c6'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/state-machine/guides/builder-pattern',
        component: ComponentCreator('/state-machine/guides/builder-pattern', '9a1'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/state-machine/guides/guards-and-actions',
        component: ComponentCreator('/state-machine/guides/guards-and-actions', 'cdb'),
        exact: true,
        sidebar: "tutorialSidebar"
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
