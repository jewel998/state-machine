---
title: Node.js Integration
description:
  Complete guide to integrating state machines with Node.js applications for workflow automation,
  API services, and business logic. Includes examples with Express, database integration, and
  microservices patterns.
keywords:
  [
    nodejs state machine,
    express integration,
    workflow automation,
    api services,
    business logic,
    database integration,
    microservices,
    event-driven architecture,
  ]
sidebar_position: 3
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# Node.js Integration

This guide demonstrates how to integrate state machines with Node.js applications for robust
server-side workflow management and business logic.

## Express.js Integration

Create a RESTful API with state machine-powered workflows:

<Tabs groupId="express-integration">
  <TabItem value="workflow-manager" label="workflow-manager.js">

```javascript showLineNumbers title="lib/workflow-manager.js"
const { StateMachine, BaseMiddleware } = require('@jewel998/state-machine');
const EventEmitter = require('events');

class WorkflowManager extends EventEmitter {
  constructor() {
    super();
    this.workflows = new Map();
    this.definitions = new Map();
    this.setupDefinitions();
  }

  setupDefinitions() {
    // Document approval workflow
    const documentApprovalDefinition = StateMachine.definitionBuilder()
      .initialState('DRAFT')
      .state('DRAFT')
      .state('PENDING_REVIEW')
      .state('APPROVED')
      .state('REJECTED')
      .state('PUBLISHED')

      .transition('DRAFT', 'PENDING_REVIEW', 'submit_for_review')
      .guard((context) => {
        return context.document.content && context.document.content.length > 0;
      })
      .action((context) => {
        context.submittedAt = new Date();
        context.reviewers = context.document.assignedReviewers || [];
        this.emit('workflow:submitted', context);
      })

      .transition('PENDING_REVIEW', 'APPROVED', 'approve')
      .guard((context) => {
        return context.reviewerId && context.reviewers.includes(context.reviewerId);
      })
      .action((context) => {
        context.approvedAt = new Date();
        context.approvedBy = context.reviewerId;
        this.emit('workflow:approved', context);
      })

      .transition('PENDING_REVIEW', 'REJECTED', 'reject')
      .guard((context) => {
        return context.reviewerId && context.reviewers.includes(context.reviewerId);
      })
      .action((context) => {
        context.rejectedAt = new Date();
        context.rejectedBy = context.reviewerId;
        context.rejectionReason = context.reason || 'No reason provided';
        this.emit('workflow:rejected', context);
      })

      .transition('APPROVED', 'PUBLISHED', 'publish')
      .action((context) => {
        context.publishedAt = new Date();
        this.emit('workflow:published', context);
      })

      .transition('REJECTED', 'DRAFT', 'revise')
      .action((context) => {
        context.revisedAt = new Date();
        context.revisionCount = (context.revisionCount || 0) + 1;
        this.emit('workflow:revised', context);
      })

      .buildDefinition();

    this.definitions.set('document_approval', documentApprovalDefinition);

    // User onboarding workflow
    const userOnboardingDefinition = StateMachine.definitionBuilder()
      .initialState('REGISTERED')
      .state('REGISTERED')
      .state('EMAIL_VERIFIED')
      .state('PROFILE_COMPLETED')
      .state('ONBOARDING_COMPLETED')
      .state('SUSPENDED')

      .transition('REGISTERED', 'EMAIL_VERIFIED', 'verify_email')
      .guard((context) => context.emailToken && context.emailToken === context.providedToken)
      .action((context) => {
        context.emailVerifiedAt = new Date();
        this.emit('user:email_verified', context);
      })

      .transition('EMAIL_VERIFIED', 'PROFILE_COMPLETED', 'complete_profile')
      .guard((context) => {
        const profile = context.profile;
        return profile && profile.firstName && profile.lastName && profile.dateOfBirth;
      })
      .action((context) => {
        context.profileCompletedAt = new Date();
        this.emit('user:profile_completed', context);
      })

      .transition('PROFILE_COMPLETED', 'ONBOARDING_COMPLETED', 'complete_onboarding')
      .action((context) => {
        context.onboardingCompletedAt = new Date();
        context.isActive = true;
        this.emit('user:onboarding_completed', context);
      })

      // Suspension can happen from any active state
      .transition('EMAIL_VERIFIED', 'SUSPENDED', 'suspend')
      .transition('PROFILE_COMPLETED', 'SUSPENDED', 'suspend')
      .transition('ONBOARDING_COMPLETED', 'SUSPENDED', 'suspend')

      .buildDefinition();

    this.definitions.set('user_onboarding', userOnboardingDefinition);
  }

  createWorkflow(type, id, initialContext) {
    const definition = this.definitions.get(type);
    if (!definition) {
      throw new Error(`Unknown workflow type: ${type}`);
    }

    const workflow = {
      id,
      type,
      state: definition.getInitialState(),
      context: {
        workflowId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...initialContext,
      },
      definition,
    };

    this.workflows.set(id, workflow);
    this.emit('workflow:created', workflow);

    return workflow;
  }

  async processEvent(workflowId, event, eventData = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Merge event data into context
    const updatedContext = {
      ...workflow.context,
      ...eventData,
      updatedAt: new Date(),
    };

    const result = await workflow.definition.processEventAsync(
      workflow.state,
      event,
      updatedContext
    );

    if (result.success) {
      workflow.state = result.newState;
      workflow.context = result.context || updatedContext;

      this.emit('workflow:transition', {
        workflowId,
        from: workflow.state,
        to: result.newState,
        event,
        context: workflow.context,
      });

      return {
        success: true,
        workflow,
      };
    } else {
      this.emit('workflow:error', {
        workflowId,
        event,
        error: result.error,
        context: workflow.context,
      });

      return {
        success: false,
        error: result.error?.message || 'Transition failed',
        workflow,
      };
    }
  }

  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }

  getAvailableEvents(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return workflow.definition.getAvailableEvents(workflow.state, workflow.context);
  }

  getAllWorkflows(type = null) {
    const workflows = Array.from(this.workflows.values());
    return type ? workflows.filter((w) => w.type === type) : workflows;
  }
}

module.exports = { WorkflowManager };
```

  </TabItem>
  <TabItem value="express-app" label="express-app.js">

```javascript showLineNumbers title="app.js"
const express = require('express');
const { WorkflowManager } = require('./workflow-manager');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const workflowManager = new WorkflowManager();

// Event listeners for workflow events
workflowManager.on('workflow:submitted', (context) => {
  console.log(`Document ${context.document.id} submitted for review`);
  // Send notifications to reviewers
});

workflowManager.on('workflow:approved', (context) => {
  console.log(`Document ${context.document.id} approved by ${context.approvedBy}`);
  // Send approval notification
});

workflowManager.on('user:email_verified', (context) => {
  console.log(`User ${context.userId} verified email`);
  // Send welcome email
});

// Workflow management endpoints
app.post('/workflows', (req, res) => {
  try {
    const { type, initialContext } = req.body;
    const workflowId = uuidv4();

    const workflow = workflowManager.createWorkflow(type, workflowId, initialContext);

    res.status(201).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/workflows/:id', (req, res) => {
  try {
    const workflow = workflowManager.getWorkflow(req.params.id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    const availableEvents = workflowManager.getAvailableEvents(req.params.id);

    res.json({
      success: true,
      data: {
        ...workflow,
        availableEvents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/workflows/:id/events', async (req, res) => {
  try {
    const { event, data } = req.body;

    const result = await workflowManager.processEvent(req.params.id, event, data);

    if (result.success) {
      res.json({
        success: true,
        data: result.workflow,
        message: `Event '${event}' processed successfully`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        data: result.workflow,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/workflows', (req, res) => {
  try {
    const { type } = req.query;
    const workflows = workflowManager.getAllWorkflows(type);

    res.json({
      success: true,
      data: workflows,
      count: workflows.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Document-specific endpoints
app.post('/documents', (req, res) => {
  try {
    const { title, content, assignedReviewers } = req.body;
    const documentId = uuidv4();

    const workflow = workflowManager.createWorkflow('document_approval', uuidv4(), {
      document: {
        id: documentId,
        title,
        content,
        assignedReviewers,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        documentId,
        workflowId: workflow.id,
        state: workflow.state,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/documents/:workflowId/submit', async (req, res) => {
  try {
    const result = await workflowManager.processEvent(req.params.workflowId, 'submit_for_review');

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/documents/:workflowId/review', async (req, res) => {
  try {
    const { action, reviewerId, reason } = req.body; // action: 'approve' or 'reject'

    const result = await workflowManager.processEvent(req.params.workflowId, action, {
      reviewerId,
      reason,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// User onboarding endpoints
app.post('/users/register', (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = uuidv4();
    const emailToken = uuidv4();

    const workflow = workflowManager.createWorkflow('user_onboarding', uuidv4(), {
      userId,
      email,
      emailToken,
      profile: {},
    });

    // In a real app, send verification email here
    console.log(`Verification token for ${email}: ${emailToken}`);

    res.status(201).json({
      success: true,
      data: {
        userId,
        workflowId: workflow.id,
        message: 'Registration successful. Please check your email for verification.',
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/users/:workflowId/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const result = await workflowManager.processEvent(req.params.workflowId, 'verify_email', {
      providedToken: token,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/users/:workflowId/complete-profile', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth } = req.body;

    const result = await workflowManager.processEvent(req.params.workflowId, 'complete_profile', {
      profile: {
        firstName,
        lastName,
        dateOfBirth,
      },
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

  </TabItem>
</Tabs>

## Database Integration with MongoDB

Integrate state machines with MongoDB for persistence:

```javascript showLineNumbers title="lib/database-workflow-manager.js"
const { MongoClient } = require('mongodb');
const { WorkflowManager } = require('./workflow-manager');

class DatabaseWorkflowManager extends WorkflowManager {
  constructor(mongoUrl, dbName) {
    super();
    this.mongoUrl = mongoUrl;
    this.dbName = dbName;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    this.client = new MongoClient(this.mongoUrl);
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.collection = this.db.collection('workflows');

    // Create indexes
    await this.collection.createIndex({ id: 1 }, { unique: true });
    await this.collection.createIndex({ type: 1 });
    await this.collection.createIndex({ state: 1 });
    await this.collection.createIndex({ 'context.createdAt': 1 });

    console.log('Connected to MongoDB');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  async createWorkflow(type, id, initialContext) {
    const workflow = super.createWorkflow(type, id, initialContext);

    // Save to database
    await this.collection.insertOne({
      ...workflow,
      definition: undefined, // Don't store the definition
    });

    return workflow;
  }

  async processEvent(workflowId, event, eventData = {}) {
    const result = await super.processEvent(workflowId, event, eventData);

    if (result.success) {
      // Update database
      await this.collection.updateOne(
        { id: workflowId },
        {
          $set: {
            state: result.workflow.state,
            context: result.workflow.context,
          },
        }
      );
    }

    return result;
  }

  async getWorkflow(workflowId) {
    // Try memory first
    let workflow = super.getWorkflow(workflowId);

    if (!workflow) {
      // Load from database
      const doc = await this.collection.findOne({ id: workflowId });
      if (doc) {
        workflow = {
          ...doc,
          definition: this.definitions.get(doc.type),
        };

        // Cache in memory
        this.workflows.set(workflowId, workflow);
      }
    }

    return workflow;
  }

  async getAllWorkflows(type = null, limit = 100, skip = 0) {
    const filter = type ? { type } : {};

    const docs = await this.collection
      .find(filter)
      .sort({ 'context.createdAt': -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return docs.map((doc) => ({
      ...doc,
      definition: this.definitions.get(doc.type),
    }));
  }

  async getWorkflowsByState(state, type = null) {
    const filter = { state };
    if (type) filter.type = type;

    const docs = await this.collection.find(filter).toArray();

    return docs.map((doc) => ({
      ...doc,
      definition: this.definitions.get(doc.type),
    }));
  }

  async getWorkflowStats() {
    const pipeline = [
      {
        $group: {
          _id: { type: '$type', state: '$state' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          states: {
            $push: {
              state: '$_id.state',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ];

    return await this.collection.aggregate(pipeline).toArray();
  }
}

module.exports = { DatabaseWorkflowManager };
```

## Event-Driven Architecture

Implement event-driven patterns with state machines:

<Tabs groupId="event-driven">
  <TabItem value="event-bus" label="event-bus.js">

```javascript showLineNumbers title="lib/event-bus.js"
const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.handlers = new Map();
  }

  subscribe(eventType, handler, options = {}) {
    const { priority = 0, once = false } = options;

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlers = this.handlers.get(eventType);
    handlers.push({ handler, priority, once });

    // Sort by priority (higher first)
    handlers.sort((a, b) => b.priority - a.priority);

    if (once) {
      this.once(eventType, handler);
    } else {
      this.on(eventType, handler);
    }
  }

  async publish(eventType, data) {
    const handlers = this.handlers.get(eventType) || [];

    for (const { handler, once } of handlers) {
      try {
        await handler(data);

        if (once) {
          this.removeHandler(eventType, handler);
        }
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    }

    this.emit(eventType, data);
  }

  removeHandler(eventType, handler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.findIndex((h) => h.handler === handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }

    this.removeListener(eventType, handler);
  }
}

module.exports = { EventBus };
```

  </TabItem>
  <TabItem value="event-driven-workflow" label="event-driven-workflow.js">

```javascript showLineNumbers title="lib/event-driven-workflow.js"
const { DatabaseWorkflowManager } = require('./database-workflow-manager');
const { EventBus } = require('./event-bus');

class EventDrivenWorkflowManager extends DatabaseWorkflowManager {
  constructor(mongoUrl, dbName) {
    super(mongoUrl, dbName);
    this.eventBus = new EventBus();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Document workflow events
    this.eventBus.subscribe('workflow:submitted', async (context) => {
      // Send notifications to reviewers
      await this.sendNotification(context.reviewers, 'document_review_requested', {
        documentId: context.document.id,
        title: context.document.title,
        workflowId: context.workflowId,
      });
    });

    this.eventBus.subscribe('workflow:approved', async (context) => {
      // Auto-publish if configured
      if (context.document.autoPublish) {
        setTimeout(async () => {
          await this.processEvent(context.workflowId, 'publish');
        }, 1000);
      }
    });

    this.eventBus.subscribe('workflow:rejected', async (context) => {
      // Notify document author
      await this.sendNotification([context.document.authorId], 'document_rejected', {
        documentId: context.document.id,
        reason: context.rejectionReason,
        workflowId: context.workflowId,
      });
    });

    // User onboarding events
    this.eventBus.subscribe('user:email_verified', async (context) => {
      // Send welcome email with profile completion link
      await this.sendNotification([context.userId], 'welcome_email', {
        userId: context.userId,
        workflowId: context.workflowId,
      });
    });

    this.eventBus.subscribe('user:onboarding_completed', async (context) => {
      // Create user account in external systems
      await this.createUserAccount(context);

      // Send completion notification
      await this.sendNotification([context.userId], 'onboarding_completed', {
        userId: context.userId,
      });
    });

    // Workflow lifecycle events
    this.eventBus.subscribe('workflow:transition', async (data) => {
      console.log(`Workflow ${data.workflowId}: ${data.from} -> ${data.to} (${data.event})`);

      // Log to audit trail
      await this.logAuditEvent(data);
    });

    this.eventBus.subscribe('workflow:error', async (data) => {
      console.error(`Workflow error in ${data.workflowId}:`, data.error);

      // Log error and potentially alert administrators
      await this.logError(data);
    });
  }

  async processEvent(workflowId, event, eventData = {}) {
    const result = await super.processEvent(workflowId, event, eventData);

    // Publish events through event bus
    if (result.success) {
      await this.eventBus.publish('workflow:transition', {
        workflowId,
        from: result.workflow.state,
        to: result.workflow.state,
        event,
        context: result.workflow.context,
      });
    } else {
      await this.eventBus.publish('workflow:error', {
        workflowId,
        event,
        error: result.error,
        context: result.workflow?.context,
      });
    }

    return result;
  }

  async sendNotification(recipients, type, data) {
    // Implement notification logic (email, SMS, push, etc.)
    console.log(`Sending ${type} notification to:`, recipients, data);

    // Example: Add to notification queue
    for (const recipient of recipients) {
      await this.db.collection('notifications').insertOne({
        recipient,
        type,
        data,
        createdAt: new Date(),
        sent: false,
      });
    }
  }

  async createUserAccount(context) {
    // Implement user account creation in external systems
    console.log(`Creating user account for ${context.userId}`);

    // Example: Call external API
    // await externalAPI.createUser(context.userId, context.profile);
  }

  async logAuditEvent(data) {
    await this.db.collection('audit_log').insertOne({
      ...data,
      timestamp: new Date(),
    });
  }

  async logError(data) {
    await this.db.collection('error_log').insertOne({
      ...data,
      timestamp: new Date(),
    });
  }

  // Subscribe to external events
  subscribeToEvent(eventType, handler, options) {
    this.eventBus.subscribe(eventType, handler, options);
  }

  // Publish external events
  async publishEvent(eventType, data) {
    await this.eventBus.publish(eventType, data);
  }
}

module.exports = { EventDrivenWorkflowManager };
```

  </TabItem>
</Tabs>

## Microservices Integration

Create a microservice with state machine workflows:

```javascript showLineNumbers title="services/workflow-microservice.js"
const express = require('express');
const { EventDrivenWorkflowManager } = require('./event-driven-workflow');
const { createProxyMiddleware } = require('http-proxy-middleware');

class WorkflowMicroservice {
  constructor(config) {
    this.config = config;
    this.app = express();
    this.workflowManager = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Error handling
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'workflow-microservice',
      });
    });

    // Workflow management
    this.app.post('/api/workflows', async (req, res) => {
      try {
        const { type, initialContext } = req.body;
        const workflowId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const workflow = await this.workflowManager.createWorkflow(
          type,
          workflowId,
          initialContext
        );

        res.status(201).json({
          success: true,
          data: workflow,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    });

    this.app.get('/api/workflows/:id', async (req, res) => {
      try {
        const workflow = await this.workflowManager.getWorkflow(req.params.id);

        if (!workflow) {
          return res.status(404).json({
            success: false,
            error: 'Workflow not found',
          });
        }

        const availableEvents = this.workflowManager.getAvailableEvents(req.params.id);

        res.json({
          success: true,
          data: {
            ...workflow,
            availableEvents,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    this.app.post('/api/workflows/:id/events', async (req, res) => {
      try {
        const { event, data } = req.body;

        const result = await this.workflowManager.processEvent(req.params.id, event, data);

        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    this.app.get('/api/workflows', async (req, res) => {
      try {
        const { type, state, limit = 50, skip = 0 } = req.query;

        let workflows;
        if (state) {
          workflows = await this.workflowManager.getWorkflowsByState(state, type);
        } else {
          workflows = await this.workflowManager.getAllWorkflows(
            type,
            parseInt(limit),
            parseInt(skip)
          );
        }

        res.json({
          success: true,
          data: workflows,
          count: workflows.length,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Statistics
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.workflowManager.getWorkflowStats();

        res.json({
          success: true,
          data: stats,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Event subscription endpoint for other services
    this.app.post('/api/events/subscribe', (req, res) => {
      const { eventType, webhookUrl } = req.body;

      // Subscribe to events and forward to webhook
      this.workflowManager.subscribeToEvent(eventType, async (data) => {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType, data }),
          });
        } catch (error) {
          console.error(`Failed to send webhook to ${webhookUrl}:`, error);
        }
      });

      res.json({
        success: true,
        message: `Subscribed to ${eventType} events`,
      });
    });
  }

  async start() {
    try {
      // Initialize workflow manager
      this.workflowManager = new EventDrivenWorkflowManager(
        this.config.mongoUrl,
        this.config.dbName
      );

      await this.workflowManager.connect();

      // Start server
      const server = this.app.listen(this.config.port, () => {
        console.log(`Workflow microservice running on port ${this.config.port}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        console.log('Received SIGTERM, shutting down gracefully');
        server.close(async () => {
          await this.workflowManager.disconnect();
          process.exit(0);
        });
      });

      return server;
    } catch (error) {
      console.error('Failed to start microservice:', error);
      process.exit(1);
    }
  }
}

// Usage
if (require.main === module) {
  const config = {
    port: process.env.PORT || 3000,
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'workflows',
  };

  const service = new WorkflowMicroservice(config);
  service.start();
}

module.exports = { WorkflowMicroservice };
```

## Testing

Create comprehensive tests for your Node.js integration:

```javascript showLineNumbers title="__tests__/workflow-manager.test.js"
const { WorkflowManager } = require('./workflow-manager');

describe('WorkflowManager', () => {
  let workflowManager;

  beforeEach(() => {
    workflowManager = new WorkflowManager();
  });

  describe('Document Approval Workflow', () => {
    test('should create document approval workflow', () => {
      const workflow = workflowManager.createWorkflow('document_approval', 'test-doc-1', {
        document: {
          id: 'doc-1',
          title: 'Test Document',
          content: 'This is a test document',
          assignedReviewers: ['reviewer1', 'reviewer2'],
        },
      });

      expect(workflow.state).toBe('DRAFT');
      expect(workflow.context.document.id).toBe('doc-1');
    });

    test('should submit document for review', async () => {
      const workflow = workflowManager.createWorkflow('document_approval', 'test-doc-2', {
        document: {
          id: 'doc-2',
          title: 'Test Document',
          content: 'This is a test document',
          assignedReviewers: ['reviewer1'],
        },
      });

      const result = await workflowManager.processEvent('test-doc-2', 'submit_for_review');

      expect(result.success).toBe(true);
      expect(result.workflow.state).toBe('PENDING_REVIEW');
      expect(result.workflow.context.submittedAt).toBeDefined();
    });

    test('should reject invalid submission', async () => {
      const workflow = workflowManager.createWorkflow('document_approval', 'test-doc-3', {
        document: {
          id: 'doc-3',
          title: 'Test Document',
          content: '', // Empty content should fail guard
          assignedReviewers: ['reviewer1'],
        },
      });

      const result = await workflowManager.processEvent('test-doc-3', 'submit_for_review');

      expect(result.success).toBe(false);
      expect(result.workflow.state).toBe('DRAFT');
    });

    test('should approve document', async () => {
      const workflow = workflowManager.createWorkflow('document_approval', 'test-doc-4', {
        document: {
          id: 'doc-4',
          title: 'Test Document',
          content: 'Valid content',
          assignedReviewers: ['reviewer1'],
        },
      });

      // Submit for review
      await workflowManager.processEvent('test-doc-4', 'submit_for_review');

      // Approve
      const result = await workflowManager.processEvent('test-doc-4', 'approve', {
        reviewerId: 'reviewer1',
      });

      expect(result.success).toBe(true);
      expect(result.workflow.state).toBe('APPROVED');
      expect(result.workflow.context.approvedBy).toBe('reviewer1');
    });
  });

  describe('User Onboarding Workflow', () => {
    test('should create user onboarding workflow', () => {
      const workflow = workflowManager.createWorkflow('user_onboarding', 'test-user-1', {
        userId: 'user-1',
        email: 'test@example.com',
        emailToken: 'token123',
        profile: {},
      });

      expect(workflow.state).toBe('REGISTERED');
      expect(workflow.context.userId).toBe('user-1');
    });

    test('should verify email', async () => {
      const workflow = workflowManager.createWorkflow('user_onboarding', 'test-user-2', {
        userId: 'user-2',
        email: 'test@example.com',
        emailToken: 'token123',
        profile: {},
      });

      const result = await workflowManager.processEvent('test-user-2', 'verify_email', {
        providedToken: 'token123',
      });

      expect(result.success).toBe(true);
      expect(result.workflow.state).toBe('EMAIL_VERIFIED');
      expect(result.workflow.context.emailVerifiedAt).toBeDefined();
    });

    test('should complete full onboarding flow', async () => {
      const workflow = workflowManager.createWorkflow('user_onboarding', 'test-user-3', {
        userId: 'user-3',
        email: 'test@example.com',
        emailToken: 'token123',
        profile: {},
      });

      // Verify email
      await workflowManager.processEvent('test-user-3', 'verify_email', {
        providedToken: 'token123',
      });

      // Complete profile
      await workflowManager.processEvent('test-user-3', 'complete_profile', {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
        },
      });

      // Complete onboarding
      const result = await workflowManager.processEvent('test-user-3', 'complete_onboarding');

      expect(result.success).toBe(true);
      expect(result.workflow.state).toBe('ONBOARDING_COMPLETED');
      expect(result.workflow.context.isActive).toBe(true);
    });
  });
});
```

This Node.js integration provides a comprehensive foundation for building scalable, event-driven
applications with state machine workflows, including database persistence, microservices
architecture, and robust testing.
