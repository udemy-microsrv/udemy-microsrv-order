import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PaginationAndFilterDto } from './dto/pagination-and-filter.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('orders.create')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
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
}
