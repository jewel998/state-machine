---
title: NestJS Integration
description:
  Complete guide to integrating state machines with NestJS for workflow management, order
  processing, and business logic. Includes examples with dependency injection, guards, interceptors,
  and database integration.
keywords:
  [
    nestjs state machine,
    backend workflow,
    order processing,
    business logic,
    dependency injection,
    guards,
    interceptors,
    database integration,
    microservices,
  ]
sidebar_position: 2
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

# NestJS Integration

This guide demonstrates how to integrate state machines with NestJS for robust backend workflow
management and business logic.

## Basic Service Integration

Create a state machine service with dependency injection:

<Tabs groupId="nestjs-service">
  <TabItem value="types" label="types.ts">

```typescript title="types/order.types.ts"
export interface OrderContext {
  orderId: string;
  customerId: string;
  amount: number;
  items: Array<{ id: string; quantity: number; price: number }>;
  paymentMethod: string;
  shippingAddress: any;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export type OrderState =
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderEvent =
  | 'process_payment'
  | 'payment_success'
  | 'payment_failed'
  | 'prepare'
  | 'ship'
  | 'deliver'
  | 'cancel'
  | 'refund';
```

  </TabItem>
  <TabItem value="service" label="order-state-machine.service.ts">

```typescript title="services/order-state-machine.service.ts"
import { Injectable, Logger } from '@nestjs/common';
import { StateMachine, IStateMachineDefinition } from '@jewel998/state-machine';
import { OrderContext, OrderState, OrderEvent } from '../types/order.types';

@Injectable()
export class OrderStateMachineService {
  private readonly logger = new Logger(OrderStateMachineService.name);
  private readonly definition: IStateMachineDefinition<OrderContext, OrderState, OrderEvent>;

  constructor() {
    this.definition = this.createOrderDefinition();
  }

  private createOrderDefinition(): IStateMachineDefinition<OrderContext, OrderState, OrderEvent> {
    return (
      StateMachine.definitionBuilder<OrderContext, OrderState, OrderEvent>()
        .initialState('PENDING')

        // Define all states
        .state('PENDING')
        .state('PAYMENT_PROCESSING')
        .state('PAID')
        .state('PREPARING')
        .state('SHIPPED')
        .state('DELIVERED')
        .state('CANCELLED')
        .state('REFUNDED')

        // Payment flow
        .transition('PENDING', 'PAYMENT_PROCESSING', 'process_payment')
        .guard((context) => context.amount > 0 && context.paymentMethod)
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.paymentStarted = new Date();
          this.logger.log(`Processing payment for order ${context.orderId}`);
        })

        .transition('PAYMENT_PROCESSING', 'PAID', 'payment_success')
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.paymentCompleted = new Date();
          this.logger.log(`Payment successful for order ${context.orderId}`);
        })

        .transition('PAYMENT_PROCESSING', 'CANCELLED', 'payment_failed')
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.paymentFailed = new Date();
          this.logger.warn(`Payment failed for order ${context.orderId}`);
        })

        // Fulfillment flow
        .transition('PAID', 'PREPARING', 'prepare')
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.preparationStarted = new Date();
          this.logger.log(`Preparing order ${context.orderId}`);
        })

        .transition('PREPARING', 'SHIPPED', 'ship')
        .guard((context) => context.shippingAddress)
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.shippedAt = new Date();
          this.logger.log(`Shipped order ${context.orderId}`);
        })

        .transition('SHIPPED', 'DELIVERED', 'deliver')
        .action((context) => {
          context.updatedAt = new Date();
          context.metadata.deliveredAt = new Date();
          this.logger.log(`Delivered order ${context.orderId}`);
        })

        // Cancellation flow
        .transition('PENDING', 'CANCELLED', 'cancel')
        .transition('PAYMENT_PROCESSING', 'CANCELLED', 'cancel')
        .transition('PAID', 'CANCELLED', 'cancel')
        .transition('PREPARING', 'CANCELLED', 'cancel')

        // Refund flow
        .transition('PAID', 'REFUNDED', 'refund')
        .transition('PREPARING', 'REFUNDED', 'refund')
        .transition('SHIPPED', 'REFUNDED', 'refund')
        .transition('DELIVERED', 'REFUNDED', 'refund')

        // Entry actions
        .onStateEntry('CANCELLED', (context) => {
          context.metadata.cancelledAt = new Date();
          this.logger.warn(`Order ${context.orderId} cancelled`);
        })

        .onStateEntry('REFUNDED', (context) => {
          context.metadata.refundedAt = new Date();
          this.logger.log(`Order ${context.orderId} refunded`);
        })

        .buildDefinition()
    );
  }

  async processOrderEvent(currentState: OrderState, event: OrderEvent, context: OrderContext) {
    try {
      const result = await this.definition.processEventAsync(currentState, event, context);

      if (result.success) {
        this.logger.log(
          `Order ${context.orderId}: ${currentState} -> ${event} -> ${result.newState}`
        );
        return {
          success: true,
          newState: result.newState,
          context: result.context || context,
        };
      } else {
        this.logger.error(
          `Order ${context.orderId}: Failed transition ${currentState} -> ${event}`,
          result.error
        );
        return {
          success: false,
          error: result.error?.message || 'Transition failed',
          currentState,
        };
      }
    } catch (error) {
      this.logger.error(`Unexpected error processing order event`, error);
      throw error;
    }
  }

  canProcessEvent(currentState: OrderState, event: OrderEvent, context: OrderContext): boolean {
    return this.definition.canTransition(currentState, event, context);
  }

  getAvailableEvents(currentState: OrderState, context: OrderContext): OrderEvent[] {
    return this.definition.getAvailableEvents(currentState, context) as OrderEvent[];
  }

  getInitialState(): OrderState {
    return this.definition.getInitialState();
  }
}
```

  </TabItem>
</Tabs>

## Database Integration with TypeORM

Integrate state machines with database entities:

<Tabs groupId="database-integration">
  <TabItem value="entity" label="order.entity.ts">

```typescript title="entities/order.entity.ts"
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderState, OrderContext } from './order-state-machine.service';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('json')
  items: Array<{ id: string; quantity: number; price: number }>;

  @Column()
  paymentMethod: string;

  @Column('json', { nullable: true })
  shippingAddress: any;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'PAYMENT_PROCESSING',
      'PAID',
      'PREPARING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ],
    default: 'PENDING',
  })
  state: OrderState;

  @Column('json', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Convert entity to state machine context
  toContext(): OrderContext {
    return {
      orderId: this.id,
      customerId: this.customerId,
      amount: this.amount,
      items: this.items,
      paymentMethod: this.paymentMethod,
      shippingAddress: this.shippingAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata || {},
    };
  }

  // Update entity from context
  fromContext(context: OrderContext): void {
    this.updatedAt = context.updatedAt;
    this.metadata = context.metadata;
  }
}
```

  </TabItem>
  <TabItem value="service" label="order.service.ts">

```typescript title="services/order.service.ts"
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderStateMachineService, OrderEvent } from './order-state-machine.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly stateMachineService: OrderStateMachineService
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create({
      ...orderData,
      state: this.stateMachineService.getInitialState(),
      metadata: {},
    });

    return await this.orderRepository.save(order);
  }

  async processOrderEvent(orderId: string, event: OrderEvent): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const context = order.toContext();

    // Check if transition is valid
    if (!this.stateMachineService.canProcessEvent(order.state, event, context)) {
      const availableEvents = this.stateMachineService.getAvailableEvents(order.state, context);
      throw new BadRequestException(
        `Cannot process event '${event}' in state '${order.state}'. Available events: ${availableEvents.join(', ')}`
      );
    }

    // Process the event
    const result = await this.stateMachineService.processOrderEvent(order.state, event, context);

    if (!result.success) {
      throw new BadRequestException(`Failed to process event: ${result.error}`);
    }

    // Update the order
    order.state = result.newState;
    order.fromContext(result.context);

    return await this.orderRepository.save(order);
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }

  async getOrderWithAvailableActions(orderId: string) {
    const order = await this.getOrder(orderId);
    const context = order.toContext();
    const availableEvents = this.stateMachineService.getAvailableEvents(order.state, context);

    return {
      ...order,
      availableEvents,
    };
  }
}
```

  </TabItem>
</Tabs>

## Controller Implementation

Create REST endpoints for order management:

<Tabs groupId="controller">
  <TabItem value="dto" label="dto.ts">

```typescript title="dto/order.dto.ts"
export class CreateOrderDto {
  customerId: string;
  amount: number;
  items: Array<{ id: string; quantity: number; price: number }>;
  paymentMethod: string;
  shippingAddress?: any;
}

export class ProcessEventDto {
  event: OrderEvent;
}
```

  </TabItem>
  <TabItem value="controller" label="order.controller.ts">

```typescript title="controllers/order.controller.ts"
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
  HttpException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { OrderEvent } from '../types/order.types';
import { CreateOrderDto, ProcessEventDto } from '../dto/order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.orderService.createOrder(createOrderDto);
      this.logger.log(`Created order ${order.id}`);

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw new HttpException('Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrder(@Param('id') id: string) {
    try {
      const order = await this.orderService.getOrderWithAvailableActions(id);

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      this.logger.error(`Failed to get order ${id}`, error);
      throw new HttpException('Failed to retrieve order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/events')
  @ApiOperation({ summary: 'Process an event for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  async processEvent(@Param('id') id: string, @Body() processEventDto: ProcessEventDto) {
    try {
      const order = await this.orderService.processOrderEvent(id, processEventDto.event);
      this.logger.log(`Processed event ${processEventDto.event} for order ${id}`);

      return {
        success: true,
        data: order,
        message: `Event '${processEventDto.event}' processed successfully`,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND || error.status === HttpStatus.BAD_REQUEST) {
        throw error;
      }

      this.logger.error(`Failed to process event ${processEventDto.event} for order ${id}`, error);
      throw new HttpException('Failed to process event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/available-events')
  @ApiOperation({ summary: 'Get available events for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async getAvailableEvents(@Param('id') id: string) {
    try {
      const order = await this.orderService.getOrderWithAvailableActions(id);

      return {
        success: true,
        data: {
          orderId: id,
          currentState: order.state,
          availableEvents: order.availableEvents,
        },
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      this.logger.error(`Failed to get available events for order ${id}`, error);
      throw new HttpException('Failed to get available events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

  </TabItem>
</Tabs>

## Middleware Integration

Create middleware for logging and validation:

<Tabs groupId="middleware">
  <TabItem value="audit" label="audit.middleware.ts">

```typescript title="middleware/audit.middleware.ts"
import { Injectable, Logger } from '@nestjs/common';
import { BaseMiddleware } from '@jewel998/state-machine';

@Injectable()
export class AuditMiddleware extends BaseMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor() {
    super('audit', { priority: -100 });
  }

  async onAction(context, next) {
    const startTime = Date.now();

    this.logger.log(`Action starting for order ${context.currentContext.orderId}`);

    try {
      const result = await next();
      const duration = Date.now() - startTime;

      this.logger.log(
        `Action completed for order ${context.currentContext.orderId} in ${duration}ms`
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        `Action failed for order ${context.currentContext.orderId} after ${duration}ms`,
        error
      );

      throw error;
    }
  }

  async onGuard(context, next) {
    this.logger.log(`Guard check for order ${context.currentContext.orderId}`);

    const result = await next();

    this.logger.log(`Guard result for order ${context.currentContext.orderId}: ${result}`);

    return result;
  }
}

@Injectable()
export class ValidationMiddleware extends BaseMiddleware {
  private readonly logger = new Logger(ValidationMiddleware.name);

  constructor() {
    super('validation', { priority: -50 });
  }

  async onAction(context, next) {
    // Validate context before action
    const orderContext = context.currentContext;

    if (!orderContext.orderId) {
      throw new Error('Order ID is required');
    }

    if (orderContext.amount < 0) {
      throw new Error('Order amount cannot be negative');
    }

    return await next();
  }
}
```

  </TabItem>
  <TabItem value="validation" label="validation.middleware.ts">

```typescript title="middleware/validation.middleware.ts"
import { Injectable, Logger } from '@nestjs/common';
import { BaseMiddleware } from '@jewel998/state-machine';

@Injectable()
export class ValidationMiddleware extends BaseMiddleware {
  private readonly logger = new Logger(ValidationMiddleware.name);

  constructor() {
    super('validation', { priority: -50 });
  }

  async onAction(context, next) {
    // Validate context before action
    const orderContext = context.currentContext;

    if (!orderContext.orderId) {
      throw new Error('Order ID is required');
    }

    if (orderContext.amount < 0) {
      throw new Error('Order amount cannot be negative');
    }

    return await next();
  }
}
```

  </TabItem>
</Tabs>

## Background Job Integration

Integrate with job queues for async processing:

<Tabs groupId="background-jobs">
  <TabItem value="processor-service" label="order-processor.service.ts">

```typescript title="services/order-processor.service.ts"
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderService } from './order.service';
import { OrderEvent } from './order-state-machine.service';

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    @InjectQueue('order-processing') private orderQueue: Queue,
    private readonly orderService: OrderService
  ) {}

  async scheduleOrderEvent(orderId: string, event: OrderEvent, delay = 0) {
    await this.orderQueue.add('process-order-event', { orderId, event }, { delay });

    this.logger.log(`Scheduled event ${event} for order ${orderId} with delay ${delay}ms`);
  }

  async schedulePaymentTimeout(orderId: string, timeoutMs = 300000) {
    // 5 minutes
    await this.orderQueue.add('payment-timeout', { orderId }, { delay: timeoutMs });

    this.logger.log(`Scheduled payment timeout for order ${orderId} in ${timeoutMs}ms`);
  }

  async scheduleShippingNotification(orderId: string, delayMs = 86400000) {
    // 24 hours
    await this.orderQueue.add('shipping-notification', { orderId }, { delay: delayMs });

    this.logger.log(`Scheduled shipping notification for order ${orderId} in ${delayMs}ms`);
  }
}
```

  </TabItem>
  <TabItem value="processor" label="order-processor.processor.ts">

```typescript title="processors/order-processor.processor.ts"
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderEvent } from './order-state-machine.service';

@Processor('order-processing')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly orderService: OrderService) {}

  @Process('process-order-event')
  async processOrderEvent(job: Job<{ orderId: string; event: OrderEvent }>) {
    const { orderId, event } = job.data;

    try {
      this.logger.log(`Processing scheduled event ${event} for order ${orderId}`);

      await this.orderService.processOrderEvent(orderId, event);

      this.logger.log(`Successfully processed event ${event} for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process event ${event} for order ${orderId}`, error);
      throw error;
    }
  }

  @Process('payment-timeout')
  async handlePaymentTimeout(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;

    try {
      const order = await this.orderService.getOrder(orderId);

      // Only cancel if still in payment processing
      if (order.state === 'PAYMENT_PROCESSING') {
        await this.orderService.processOrderEvent(orderId, 'payment_failed');
        this.logger.warn(`Payment timeout - cancelled order ${orderId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle payment timeout for order ${orderId}`, error);
    }
  }

  @Process('shipping-notification')
  async sendShippingNotification(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;

    try {
      const order = await this.orderService.getOrder(orderId);

      if (order.state === 'SHIPPED') {
        // Send notification logic here
        this.logger.log(`Sent shipping notification for order ${orderId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send shipping notification for order ${orderId}`, error);
    }
  }
}
```

  </TabItem>
</Tabs>

## Module Configuration

Wire everything together in a NestJS module:

```typescript title="modules/order.module.ts"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Order } from './order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStateMachineService } from './order-state-machine.service';
import { OrderProcessorService } from './order-processor.service';
import { OrderProcessor } from './order-processor.processor';
import { AuditMiddleware, ValidationMiddleware } from './state-machine.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.registerQueue({
      name: 'order-processing',
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderStateMachineService,
    OrderProcessorService,
    OrderProcessor,
    AuditMiddleware,
    ValidationMiddleware,
  ],
  exports: [OrderService, OrderStateMachineService],
})
export class OrderModule {}
```

## Testing

Create comprehensive tests for your state machine integration:

```typescript title="__tests__/order.service.spec.ts"
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from './order.service';
import { OrderStateMachineService } from './order-state-machine.service';
import { Order } from './order.entity';

describe('OrderService', () => {
  let service: OrderService;
  let repository: Repository<Order>;
  let stateMachineService: OrderStateMachineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        OrderStateMachineService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
    stateMachineService = module.get<OrderStateMachineService>(OrderStateMachineService);
  });

  describe('processOrderEvent', () => {
    it('should process payment successfully', async () => {
      const order = new Order();
      order.id = 'test-order-id';
      order.state = 'PENDING';
      order.amount = 100;
      order.paymentMethod = 'credit_card';

      jest.spyOn(repository, 'findOne').mockResolvedValue(order);
      jest.spyOn(repository, 'save').mockResolvedValue(order);

      const result = await service.processOrderEvent('test-order-id', 'process_payment');

      expect(result.state).toBe('PAYMENT_PROCESSING');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid transition', async () => {
      const order = new Order();
      order.id = 'test-order-id';
      order.state = 'DELIVERED';

      jest.spyOn(repository, 'findOne').mockResolvedValue(order);

      await expect(service.processOrderEvent('test-order-id', 'process_payment')).rejects.toThrow(
        'Cannot process event'
      );
    });
  });
});
```

This NestJS integration provides a robust foundation for building complex backend workflows with
state machines, including proper error handling, database persistence, background job processing,
and comprehensive testing.
