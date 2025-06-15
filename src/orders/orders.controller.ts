import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PaginationAndFilterDto } from './dto/pagination-and-filter.dto';
import { PaidOrderDto } from './dto/paid-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('orders.create')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);
    return {
      order,
      paymentSession,
    };
  }

  @MessagePattern('orders.find_all')
  findAll(@Payload() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.ordersService.findAll(paginationAndFilterDto);
  }

  @MessagePattern('orders.find_one')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('orders.change_status')
  changeStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
    return this.ordersService.changeStatus(changeOrderStatusDto);
  }

  @EventPattern('payments.succeeded')
  async markAsPaid(@Payload() paidOrderDto: PaidOrderDto) {
    await this.ordersService.markAsPaid(paidOrderDto);
  }
}
