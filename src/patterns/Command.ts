/**
 * Command pattern for state machine actions and transitions
 */

export interface ICommand<TResult = void> {
  execute(): TResult;
  undo?(): void;
  canUndo?(): boolean;
}

export interface ICommandInvoker {
  executeCommand<TResult>(command: ICommand<TResult>): TResult;
  undo(): boolean;
  canUndo(): boolean;
  clearHistory(): void;
}

/**
 * Command invoker with undo functionality
 */
export class CommandInvoker implements ICommandInvoker {
  private readonly history: Array<ICommand<unknown>> = [];
  private readonly maxHistorySize: number;

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  public executeCommand<TResult>(command: ICommand<TResult>): TResult {
    const result = command.execute();

    // Only store commands that can be undone
    if (command.canUndo?.() !== false && command.undo) {
      this.history.push(command);

      // Maintain history size limit
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }

    return result;
  }

  public undo(): boolean {
    const command = this.history.pop();
    if (command?.undo) {
      try {
        command.undo();
        return true;
      } catch (error) {
        // Re-add command to history if undo fails
        this.history.push(command);
        throw error;
      }
    }
    return false;
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public clearHistory(): void {
    this.history.length = 0;
  }

  public getHistorySize(): number {
    return this.history.length;
  }
}

/**
 * Abstract base command class
 */
export abstract class BaseCommand<TResult = void> implements ICommand<TResult> {
  protected executed = false;

  public abstract execute(): TResult;

  public undo?(): void;

  public canUndo(): boolean {
    return this.executed && typeof this.undo === 'function';
  }
}

/**
 * Composite command for executing multiple commands as one
 */
export class CompositeCommand extends BaseCommand<void> {
  private readonly commands: readonly ICommand<unknown>[];

  constructor(commands: readonly ICommand<unknown>[]) {
    super();
    this.commands = [...commands];
  }

  public execute(): void {
    this.commands.forEach((command) => command.execute());
    this.executed = true;
  }

  public override undo(): void {
    if (!this.executed) return;

    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const command = this.commands[i];
      if (command?.undo) {
        command.undo();
      }
    }
    this.executed = false;
  }

  public override canUndo(): boolean {
    return (
      this.executed && this.commands.some((cmd) => cmd.canUndo?.() !== false)
    );
  }
}
