/**
 * Example metrics middleware demonstrating state machine middleware pipeline pattern
 */

const { BaseMiddleware } = require('../dist/middleware/BaseMiddleware');

// Simple in-memory metrics collector for demonstration
class InMemoryMetricsCollector {
  constructor() {
    this.metrics = new Map();
  }

  increment(metric, tags) {
    const key = this.getKey(metric, tags);
    const existing = this.metrics.get(key) || {
      count: 0,
      values: [],
      tags: [],
    };
    existing.count += 1;
    if (tags) existing.tags.push(tags);
    this.metrics.set(key, existing);
  }

  timing(metric, duration, tags) {
    const key = this.getKey(metric, tags);
    const existing = this.metrics.get(key) || {
      count: 0,
      values: [],
      tags: [],
    };
    existing.values.push(duration);
    if (tags) existing.tags.push(tags);
    this.metrics.set(key, existing);
  }

  gauge(metric, value, tags) {
    const key = this.getKey(metric, tags);
    this.metrics.set(key, {
      count: 1,
      values: [value],
      tags: tags ? [tags] : [],
    });
  }

  histogram(metric, value, tags) {
    this.timing(metric, value, tags);
  }

  getMetrics() {
    return new Map(this.metrics);
  }

  clear() {
    this.metrics.clear();
  }

  getKey(metric, tags) {
    if (!tags || Object.keys(tags).length === 0) {
      return metric;
    }
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
    return `${metric}[${tagString}]`;
  }
}

class MetricsMiddleware extends BaseMiddleware {
  constructor(options = {}) {
    super('metrics', {
      priority: options.priority ?? 900, // Run late to capture final metrics
      enabled: options.enabled ?? true,
    });

    this.collector = options.collector ?? new InMemoryMetricsCollector();
    this.options = {
      prefix: options.prefix ?? 'state_machine',
      collectGuardMetrics: options.collectGuardMetrics ?? true,
      collectActionMetrics: options.collectActionMetrics ?? true,
      collectStateMetrics: options.collectStateMetrics ?? true,
      collectTimingMetrics: options.collectTimingMetrics ?? true,
      collectErrorMetrics: options.collectErrorMetrics ?? true,
      defaultTags: options.defaultTags ?? {},
    };
  }

  async onGuard(context, next, _originalGuard) {
    if (!this.options.collectGuardMetrics) {
      return await next();
    }

    const startTime = Date.now();
    const tags = { ...this.options.defaultTags, chain_id: context.chainId };

    this.collector.increment(this.metric('guard.started'), tags);

    try {
      const result = await next();

      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('guard.duration'),
          Date.now() - startTime,
          tags
        );
      }

      this.collector.increment(
        this.metric(`guard.result.${result ? 'success' : 'failure'}`),
        tags
      );

      return result;
    } catch (error) {
      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('guard.duration'),
          Date.now() - startTime,
          tags
        );
      }

      if (this.options.collectErrorMetrics) {
        this.collector.increment(this.metric('guard.error'), {
          ...tags,
          error_type:
            error instanceof Error ? error.constructor.name : 'Unknown',
        });
      }

      throw error;
    }
  }

  async onAction(context, next, _originalAction) {
    if (!this.options.collectActionMetrics) {
      return await next();
    }

    const startTime = Date.now();
    const tags = {
      ...this.options.defaultTags,
      chain_id: context.chainId,
      execution_order: context.executionOrder.toString(),
    };

    this.collector.increment(this.metric('action.started'), tags);

    try {
      const result = await next();

      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('action.duration'),
          Date.now() - startTime,
          tags
        );
      }

      this.collector.increment(
        this.metric(
          `action.result.${result.shouldContinue ? 'continue' : 'stop'}`
        ),
        tags
      );

      // Track metadata size if present
      if (result.metadata) {
        this.collector.gauge(
          this.metric('action.metadata_size'),
          Object.keys(result.metadata).length,
          tags
        );
      }

      return this.createResult(
        result.context,
        result.shouldContinue,
        this.mergeMetadata(result.metadata ?? {}, {
          metrics_collected: true,
          execution_time_ms: Date.now() - startTime,
        })
      );
    } catch (error) {
      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('action.duration'),
          Date.now() - startTime,
          tags
        );
      }

      if (this.options.collectErrorMetrics) {
        this.collector.increment(this.metric('action.error'), {
          ...tags,
          error_type:
            error instanceof Error ? error.constructor.name : 'Unknown',
        });
      }

      throw error;
    }
  }

  async onStateEntry(context, next, state, _originalAction) {
    if (!this.options.collectStateMetrics) {
      return await next();
    }

    const startTime = Date.now();
    const tags = {
      ...this.options.defaultTags,
      chain_id: context.chainId,
      state: String(state),
    };

    this.collector.increment(this.metric('state.entry.started'), tags);

    try {
      const result = await next();

      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('state.entry.duration'),
          Date.now() - startTime,
          tags
        );
      }

      this.collector.increment(this.metric('state.entry.completed'), tags);

      return result;
    } catch (error) {
      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('state.entry.duration'),
          Date.now() - startTime,
          tags
        );
      }

      if (this.options.collectErrorMetrics) {
        this.collector.increment(this.metric('state.entry.error'), {
          ...tags,
          error_type:
            error instanceof Error ? error.constructor.name : 'Unknown',
        });
      }

      throw error;
    }
  }

  async onStateExit(context, next, state, _originalAction) {
    if (!this.options.collectStateMetrics) {
      return await next();
    }

    const startTime = Date.now();
    const tags = {
      ...this.options.defaultTags,
      chain_id: context.chainId,
      state: String(state),
    };

    this.collector.increment(this.metric('state.exit.started'), tags);

    try {
      const result = await next();

      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('state.exit.duration'),
          Date.now() - startTime,
          tags
        );
      }

      this.collector.increment(this.metric('state.exit.completed'), tags);

      return result;
    } catch (error) {
      if (this.options.collectTimingMetrics) {
        this.collector.timing(
          this.metric('state.exit.duration'),
          Date.now() - startTime,
          tags
        );
      }

      if (this.options.collectErrorMetrics) {
        this.collector.increment(this.metric('state.exit.error'), {
          ...tags,
          error_type:
            error instanceof Error ? error.constructor.name : 'Unknown',
        });
      }

      throw error;
    }
  }

  metric(name) {
    return `${this.options.prefix}.${name}`;
  }

  // Utility method to get collected metrics (useful for testing)
  getCollectedMetrics() {
    if (this.collector instanceof InMemoryMetricsCollector) {
      return this.collector.getMetrics();
    }
    return undefined;
  }
}

module.exports = { MetricsMiddleware, InMemoryMetricsCollector };
