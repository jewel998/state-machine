---
title: React Integration
description:
  Complete guide to integrating state machines with React components, hooks, and state management.
  Includes examples for form validation, data fetching, and complex UI workflows.
keywords:
  [
    react state machine,
    react hooks,
    state management,
    form validation,
    data fetching,
    UI state,
    component state,
    react integration,
  ]
sidebar_position: 1
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# React Integration

This guide shows how to integrate state machines with React components for predictable UI state
management.

## Basic React Hook Integration

Create a custom hook for state machine integration:

<Tabs groupId="react-hook">
  <TabItem value="hook" label="useStateMachine.ts">

```typescript showLineNumbers title="hooks/useStateMachine.ts"
import { useState, useCallback, useRef } from 'react';
import { StateMachine, IStateMachineDefinition } from '@jewel998/state-machine';

interface UseStateMachineOptions<TContext, TState, TEvent> {
  definition: IStateMachineDefinition<TContext, TState, TEvent>;
  initialContext: TContext;
}

export function useStateMachine<TContext, TState, TEvent>({
  definition,
  initialContext,
}: UseStateMachineOptions<TContext, TState, TEvent>) {
  const [currentState, setCurrentState] = useState<TState>(definition.getInitialState());
  const contextRef = useRef<TContext>(initialContext);

  const processEvent = useCallback(
    (event: TEvent) => {
      const result = definition.processEvent(currentState, event, contextRef.current);

      if (result.success) {
        setCurrentState(result.newState);
        if (result.context) {
          contextRef.current = result.context;
        }
        return true;
      }
      return false;
    },
    [currentState, definition]
  );

  const processEventAsync = useCallback(
    async (event: TEvent) => {
      const result = await definition.processEventAsync(currentState, event, contextRef.current);

      if (result.success) {
        setCurrentState(result.newState);
        if (result.context) {
          contextRef.current = result.context;
        }
        return true;
      }
      return false;
    },
    [currentState, definition]
  );

  const canTransition = useCallback(
    (event: TEvent) => {
      return definition.canTransition(currentState, event, contextRef.current);
    },
    [currentState, definition]
  );

  const getAvailableEvents = useCallback(() => {
    return definition.getAvailableEvents(currentState, contextRef.current);
  }, [currentState, definition]);

  const reset = useCallback(() => {
    setCurrentState(definition.getInitialState());
    contextRef.current = initialContext;
  }, [definition, initialContext]);

  return {
    currentState,
    context: contextRef.current,
    processEvent,
    processEventAsync,
    canTransition,
    getAvailableEvents,
    reset,
  };
}
```

  </TabItem>
</Tabs>

## Form Validation Example

Create a multi-step form with state machine validation:

<Tabs groupId="form-example">
  <TabItem value="types" label="types.ts">

```typescript showLineNumbers title="types/FormTypes.ts"
// Define form context and types
export interface FormContext {
  personalInfo: {
    name: string;
    email: string;
  };
  preferences: {
    newsletter: boolean;
    theme: 'light' | 'dark';
  };
  errors: string[];
  isSubmitting: boolean;
}

export type FormState =
  | 'PERSONAL_INFO'
  | 'PREFERENCES'
  | 'REVIEW'
  | 'SUBMITTING'
  | 'SUCCESS'
  | 'ERROR';
export type FormEvent = 'next' | 'previous' | 'submit' | 'retry' | 'reset';
```

  </TabItem>
  <TabItem value="definition" label="formDefinition.ts">

```typescript showLineNumbers title="definitions/formDefinition.ts"
import { StateMachine } from '@jewel998/state-machine';
import { FormContext, FormState, FormEvent } from '../types/FormTypes';

export const formDefinition = StateMachine.definitionBuilder<FormContext, FormState, FormEvent>()
  .initialState('PERSONAL_INFO')
  .state('PERSONAL_INFO')
  .state('PREFERENCES')
  .state('REVIEW')
  .state('SUBMITTING')
  .state('SUCCESS')
  .state('ERROR')

  // Personal info to preferences
  .transition('PERSONAL_INFO', 'PREFERENCES', 'next')
  .guard((context) => {
    const { name, email } = context.personalInfo;
    return name.length > 0 && email.includes('@');
  })
  .action((context) => {
    context.errors = [];
  })

  // Preferences to review
  .transition('PREFERENCES', 'REVIEW', 'next')

  // Navigation back
  .transition('PREFERENCES', 'PERSONAL_INFO', 'previous')
  .transition('REVIEW', 'PREFERENCES', 'previous')

  // Submit flow
  .transition('REVIEW', 'SUBMITTING', 'submit')
  .action((context) => {
    context.isSubmitting = true;
  })

  .transition('SUBMITTING', 'SUCCESS', 'next')
  .transition('SUBMITTING', 'ERROR', 'next')

  // Error handling
  .transition('ERROR', 'REVIEW', 'retry')
  .action((context) => {
    context.isSubmitting = false;
  })

  // Reset from any state
  .transition('SUCCESS', 'PERSONAL_INFO', 'reset')
  .transition('ERROR', 'PERSONAL_INFO', 'reset')

  .buildDefinition();
```

  </TabItem>
  <TabItem value="component" label="MultiStepForm.tsx">

```typescript showLineNumbers title="components/MultiStepForm.tsx"
import React, { useState } from 'react';
import { useStateMachine } from '../hooks/useStateMachine';
import { formDefinition } from '../definitions/formDefinition';
import { FormContext } from '../types/FormTypes';
export const MultiStepForm: React.FC = () => {
  const {
    currentState,
    context,
    processEvent,
    processEventAsync,
    canTransition,
    getAvailableEvents,
  } = useStateMachine({
    definition: formDefinition,
    initialContext: {
      personalInfo: { name: '', email: '' },
      preferences: { newsletter: false, theme: 'light' as const },
      errors: [],
      isSubmitting: false,
    },
  });

  const [formData, setFormData] = useState(context);

  const updatePersonalInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
    // Update context reference
    Object.assign(context, {
      ...context,
      personalInfo: { ...context.personalInfo, [field]: value },
    });
  };

  const updatePreferences = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }));
    Object.assign(context, {
      ...context,
      preferences: { ...context.preferences, [field]: value },
    });
  };

  const handleSubmit = async () => {
    if (!processEvent('submit')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (Math.random() > 0.3) {
        processEvent('next'); // Success
      } else {
        context.errors = ['Submission failed. Please try again.'];
        processEvent('next'); // Error
      }
    } catch (error) {
      context.errors = ['Network error occurred.'];
      processEvent('next'); // Error
    }
  };

  const renderStep = () => {
    switch (currentState) {
      case 'PERSONAL_INFO':
        return (
          <div className="form-step">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.personalInfo.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <button
              onClick={() => processEvent('next')}
              disabled={!canTransition('next')}
              className="btn-primary"
            >
              Next
            </button>
          </div>
        );

      case 'PREFERENCES':
        return (
          <div className="form-step">
            <h2>Preferences</h2>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.preferences.newsletter}
                  onChange={(e) => updatePreferences('newsletter', e.target.checked)}
                />
                Subscribe to newsletter
              </label>
            </div>
            <div className="form-group">
              <label>Theme:</label>
              <select
                value={formData.preferences.theme}
                onChange={(e) => updatePreferences('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="form-actions">
              <button onClick={() => processEvent('previous')} className="btn-secondary">
                Previous
              </button>
              <button onClick={() => processEvent('next')} className="btn-primary">
                Next
              </button>
            </div>
          </div>
        );

      case 'REVIEW':
        return (
          <div className="form-step">
            <h2>Review Your Information</h2>
            <div className="review-section">
              <h3>Personal Information</h3>
              <p>Name: {formData.personalInfo.name}</p>
              <p>Email: {formData.personalInfo.email}</p>
            </div>
            <div className="review-section">
              <h3>Preferences</h3>
              <p>Newsletter: {formData.preferences.newsletter ? 'Yes' : 'No'}</p>
              <p>Theme: {formData.preferences.theme}</p>
            </div>
            <div className="form-actions">
              <button onClick={() => processEvent('previous')} className="btn-secondary">
                Previous
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                Submit
              </button>
            </div>
          </div>
        );

      case 'SUBMITTING':
        return (
          <div className="form-step">
            <h2>Submitting...</h2>
            <div className="loading-spinner">Please wait...</div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="form-step">
            <h2>Success!</h2>
            <p>Your form has been submitted successfully.</p>
            <button onClick={() => processEvent('reset')} className="btn-primary">
              Start Over
            </button>
          </div>
        );

      case 'ERROR':
        return (
          <div className="form-step">
            <h2>Error</h2>
            <div className="error-messages">
              {context.errors.map((error, index) => (
                <p key={index} className="error">{error}</p>
              ))}
            </div>
            <div className="form-actions">
              <button onClick={() => processEvent('retry')} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => processEvent('reset')} className="btn-secondary">
                Start Over
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="multi-step-form">
      <div className="progress-indicator">
        <div className={`step ${currentState === 'PERSONAL_INFO' ? 'active' : ''}`}>1</div>
        <div className={`step ${currentState === 'PREFERENCES' ? 'active' : ''}`}>2</div>
        <div className={`step ${currentState === 'REVIEW' ? 'active' : ''}`}>3</div>
      </div>

      {renderStep()}

      <div className="debug-info">
        <p>Current State: {currentState}</p>
        <p>Available Events: {getAvailableEvents().join(', ')}</p>
      </div>
    </div>
  );
};
```

  </TabItem>
</Tabs>

## Data Fetching with State Machine

Handle complex data fetching scenarios:

<Tabs groupId="data-fetching">
  <TabItem value="types" label="types.ts">

```typescript showLineNumbers title="types/DataTypes.ts"
export interface DataContext {
  data: any[];
  error: string | null;
  page: number;
  hasMore: boolean;
  retryCount: number;
}

export type DataState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' | 'LOADING_MORE';
export type DataEvent = 'fetch' | 'success' | 'error' | 'retry' | 'loadMore' | 'reset';
```

  </TabItem>
  <TabItem value="definition" label="dataDefinition.ts">

```typescript showLineNumbers title="definitions/dataDefinition.ts"
import { StateMachine } from '@jewel998/state-machine';
import { DataContext, DataState, DataEvent } from '../types/DataTypes';

export const dataFetchDefinition = StateMachine.definitionBuilder<
  DataContext,
  DataState,
  DataEvent
>()
  .initialState('IDLE')
  .state('IDLE')
  .state('LOADING')
  .state('SUCCESS')
  .state('ERROR')
  .state('LOADING_MORE')

  // Initial fetch
  .transition('IDLE', 'LOADING', 'fetch')
  .action((context) => {
    context.error = null;
    context.retryCount = 0;
  })

  // Success from loading
  .transition('LOADING', 'SUCCESS', 'success')
  .action((context) => {
    context.error = null;
  })

  // Error from loading
  .transition('LOADING', 'ERROR', 'error')
  .action((context) => {
    context.retryCount++;
  })

  // Load more from success
  .transition('SUCCESS', 'LOADING_MORE', 'loadMore')
  .guard((context) => context.hasMore)

  // Success from loading more
  .transition('LOADING_MORE', 'SUCCESS', 'success')

  // Error from loading more
  .transition('LOADING_MORE', 'ERROR', 'error')

  // Retry from error
  .transition('ERROR', 'LOADING', 'retry')
  .guard((context) => context.retryCount < 3)

  // Reset from any state
  .transition('SUCCESS', 'IDLE', 'reset')
  .transition('ERROR', 'IDLE', 'reset')

  .buildDefinition();
```

  </TabItem>
  <TabItem value="component" label="DataList.tsx">

```typescript showLineNumbers title="components/DataList.tsx"
import React, { useEffect } from 'react';
import { useStateMachine } from '../hooks/useStateMachine';
import { dataFetchDefinition } from '../definitions/dataDefinition';

export const DataList: React.FC = () => {
  const {
    currentState,
    context,
    processEvent,
    processEventAsync,
    canTransition,
  } = useStateMachine({
    definition: dataFetchDefinition,
    initialContext: {
      data: [],
      error: null,
      page: 1,
      hasMore: true,
      retryCount: 0,
    },
  });

  const fetchData = async (isLoadMore = false) => {
    try {
      const page = isLoadMore ? context.page + 1 : 1;

      // Simulate API call
      const response = await fetch(`/api/data?page=${page}`);
      const result = await response.json();

      if (response.ok) {
        if (isLoadMore) {
          context.data = [...context.data, ...result.data];
        } else {
          context.data = result.data;
        }
        context.page = page;
        context.hasMore = result.hasMore;

        processEvent('success');
      } else {
        context.error = result.message || 'Failed to fetch data';
        processEvent('error');
      }
    } catch (error) {
      context.error = 'Network error occurred';
      processEvent('error');
    }
  };

  const handleFetch = () => {
    if (processEvent('fetch')) {
      fetchData(false);
    }
  };

  const handleLoadMore = () => {
    if (processEvent('loadMore')) {
      fetchData(true);
    }
  };

  const handleRetry = () => {
    if (processEvent('retry')) {
      fetchData(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (currentState === 'IDLE') {
      handleFetch();
    }
  }, []);

  const renderContent = () => {
    switch (currentState) {
      case 'LOADING':
        return <div className="loading">Loading data...</div>;

      case 'SUCCESS':
        return (
          <div>
            <div className="data-list">
              {context.data.map((item, index) => (
                <div key={index} className="data-item">
                  {JSON.stringify(item)}
                </div>
              ))}
            </div>

            {context.hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={!canTransition('loadMore')}
                className="btn-secondary"
              >
                Load More
              </button>
            )}

            <button onClick={() => processEvent('reset')} className="btn-secondary">
              Reset
            </button>
          </div>
        );

      case 'LOADING_MORE':
        return (
          <div>
            <div className="data-list">
              {context.data.map((item, index) => (
                <div key={index} className="data-item">
                  {JSON.stringify(item)}
                </div>
              ))}
            </div>
            <div className="loading">Loading more...</div>
          </div>
        );

      case 'ERROR':
        return (
          <div className="error-state">
            <p className="error">Error: {context.error}</p>
            <div className="error-actions">
              {canTransition('retry') && (
                <button onClick={handleRetry} className="btn-primary">
                  Retry ({3 - context.retryCount} attempts left)
                </button>
              )}
              <button onClick={() => processEvent('reset')} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>
        );

      default:
        return (
          <button onClick={handleFetch} className="btn-primary">
            Load Data
          </button>
        );
    }
  };

  return (
    <div className="data-list-container">
      <h2>Data List</h2>
      <div className="state-indicator">
        Current State: <span className={`state ${currentState.toLowerCase()}`}>
          {currentState}
        </span>
      </div>
      {renderContent()}
    </div>
  );
};
```

  </TabItem>
</Tabs>

## Context Provider Pattern

Create a context provider for sharing state machines across components:

<Tabs groupId="context-provider">
  <TabItem value="provider" label="AppStateProvider.tsx">

```typescript showLineNumbers title="providers/AppStateProvider.tsx"
import React, { createContext, useContext, ReactNode } from 'react';
import { StateMachine } from '@jewel998/state-machine';
import { useStateMachine } from './useStateMachine';

interface AppContext {
  user: { id: string; name: string } | null;
  theme: 'light' | 'dark';
  notifications: string[];
}

type AppState = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';
type AppEvent = 'login' | 'logout' | 'loaded';

const appDefinition = StateMachine.definitionBuilder<AppContext, AppState, AppEvent>()
  .initialState('LOADING')
  .state('LOADING')
  .state('AUTHENTICATED')
  .state('UNAUTHENTICATED')

  .transition('LOADING', 'AUTHENTICATED', 'loaded')
  .guard((context) => context.user !== null)

  .transition('LOADING', 'UNAUTHENTICATED', 'loaded')
  .guard((context) => context.user === null)

  .transition('UNAUTHENTICATED', 'AUTHENTICATED', 'login')
  .transition('AUTHENTICATED', 'UNAUTHENTICATED', 'logout')
  .action((context) => {
    context.user = null;
  })

  .buildDefinition();

interface AppStateContextType {
  currentState: AppState;
  context: AppContext;
  processEvent: (event: AppEvent) => boolean;
  canTransition: (event: AppEvent) => boolean;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const stateMachine = useStateMachine({
    definition: appDefinition,
    initialContext: {
      user: null,
      theme: 'light',
      notifications: [],
    },
  });

  return (
    <AppStateContext.Provider value={stateMachine}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

// Usage in components
export const LoginButton: React.FC = () => {
  const { currentState, processEvent, canTransition } = useAppState();

  if (currentState === 'AUTHENTICATED') {
    return (
      <button onClick={() => processEvent('logout')}>
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={() => processEvent('login')}
      disabled={!canTransition('login')}
    >
      Login
    </button>
  );
};
```

  </TabItem>
  <TabItem value="usage" label="LoginButton.tsx">

```typescript showLineNumbers title="components/LoginButton.tsx"
import React from 'react';
import { useAppState } from '../providers/AppStateProvider';

export const LoginButton: React.FC = () => {
  const { currentState, processEvent, canTransition } = useAppState();

  if (currentState === 'AUTHENTICATED') {
    return (
      <button onClick={() => processEvent('logout')}>
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={() => processEvent('login')}
      disabled={!canTransition('login')}
    >
      Login
    </button>
  );
};
```

  </TabItem>
</Tabs>

## Best Practices for React Integration

### 1. Keep State Machines Pure

<Tabs groupId="best-practices">
  <TabItem value="good" label="✅ Good">

```typescript showLineNumbers title="Good: Pure state machine logic"
const definition = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .transition('IDLE', 'LOADING', 'fetch')
  .guard((context) => context.hasPermission) // Pure function
  .buildDefinition();
```

  </TabItem>
  <TabItem value="bad" label="❌ Avoid">

```typescript showLineNumbers title="Avoid: Side effects in state machine"
const badDefinition = StateMachine.definitionBuilder()
  .transition('IDLE', 'LOADING', 'fetch')
  .action((context) => {
    // Don't do this - side effects should be in React components
    document.title = 'Loading...';
    localStorage.setItem('state', 'loading');
  })
  .buildDefinition();
```

  </TabItem>
</Tabs>

### 2. Use Refs for Mutable Context

```typescript showLineNumbers title="Use refs for context management"
const useStateMachine = ({ definition, initialContext }) => {
  const contextRef = useRef(initialContext);

  // Always use the ref for current context
  const processEvent = useCallback(
    (event) => {
      const result = definition.processEvent(
        currentState,
        event,
        contextRef.current // Use ref, not state
      );
      // ...
    },
    [currentState, definition]
  );
};
```

### 3. Separate UI State from Business Logic

```typescript showLineNumbers title="Separate concerns properly"
// Business logic in state machine
const businessDefinition = StateMachine.definitionBuilder()
  .initialState('IDLE')
  .transition('IDLE', 'PROCESSING', 'process')
  .buildDefinition();

// UI state in React
const Component = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentState, processEvent } = useStateMachine({
    definition: businessDefinition,
    initialContext: {},
  });

  // Combine both for complete UI behavior
};
```

This integration provides a robust foundation for managing complex UI state with predictable
behavior and excellent developer experience.
