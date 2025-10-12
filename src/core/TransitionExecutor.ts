/**
 * Handles the execution of state transitions
 */

import { ActionExecutionError, GuardConditionError } from '@/errors';
import {
  ContextConstraint,
  EventIdentifier,
  StateIdentifier,
  Transition,
} from '@/interfaces';
import { logger } from '@/logger';
import { StateMachineCore } from './StateMachineCore';

export class TransitionExecutor<
  TContext extends ContextConstraint,
  TState extends StateIdentifier,
  TEvent extends EventIdentifier,
> {
  constructor(
    private readonly core: StateMachineCore<TContext, TState, TEvent>
  ) {}

  public executeTransition(
    transition: Transition<TContext, TState, TEvent>,
    context: TContext,
    transitionId: string
  ): void {
    const fromState = this.core.getCurrentState();

    logger.debug('Executing transition', {
      from: String(fromState),
      to: String(transition.to),
      event: String(transition.event),
      transitionId,
    });

    // Check guard condition
    if (transition.guard) {
      try {
        if (!transition.guard(context)) {
          throw new GuardConditionError(
            String(fromState),
            String(transition.to),
            String(transition.event)
          );
        }
      } catch (error) {
        if (error instanceof GuardConditionError) {
          throw error;
        }
        throw new GuardConditionError(
          String(fromState),
          String(transition.to),
          String(transition.event)
        );
      }
    }

    // Execute exit actions
    this.executeExitActions(fromState, context);

    // Execute transition action
    if (transition.action) {
      try {
        transition.action(context);
      } catch (error) {
        throw new ActionExecutionError(
          'transition',
          String(fromState),
          error as Error
        );
      }
    }

    // Change state
    this.core.setState(transition.to);

    // Execute entry actions with rollback on failure
    try {
      this.executeEntryActions(transition.to, context);
    } catch (error) {
      // Rollback state change if entry action fails
      this.core.setState(fromState);
      throw error;
    }
  }

  private executeEntryActions(state: TState, context: TContext): void {
    const actions = this.core.getEntryActions(state);
    actions.forEach((action) => {
      try {
        action.action(context);
      } catch (error) {
        throw new ActionExecutionError('entry', String(state), error as Error);
      }
    });
  }

  private executeExitActions(state: TState, context: TContext): void {
    const actions = this.core.getExitActions(state);
    actions.forEach((action) => {
      try {
        action.action(context);
      } catch (error) {
        throw new ActionExecutionError('exit', String(state), error as Error);
      }
    });
  }
}
