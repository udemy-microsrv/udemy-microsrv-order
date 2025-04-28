import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PrismaService } from '../prisma.service';
import { throwRpcException } from '../common/exceptions/throw-rpc-exception';
import { PaginationAndFilterDto } from './dto/pagination-and-filter.dto';
import { MICROSRV_PRODUCT } from '../config/microservices.token';
import { firstValueFrom, map } from 'rxjs';
import { RpcError } from '../common/exceptions/rpc-error';

type Products = {
  [id: number]: {
    id: number;
    price: number;
    name: string;
  };
};

@Injectable()
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    @Inject(MICROSRV_PRODUCT) private productClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const products = await firstValueFrom<Products>(
        this.productClient
          .send(
            { cmd: 'product.find_many' },
            {
              ids: createOrderDto.items.map((item) => item.productId),
            },
          )
          .pipe(
            map((products: Products[keyof Products][]) =>
              products.reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
              }, {}),
            ),
          ),
      );

      const totalItems = createOrderDto.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      const totalAmount = createOrderDto.items.reduce(
        (acc, item) => acc + products[item.productId].price * item.quantity,
        0,
      );

      const order = await this.prismaService.order.create({
        data: {
          totalItems,
          totalAmount,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((item) => ({
                ...item,
                price: products[item.productId].price,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((item) => ({
          ...item,
          productName: products[item.productId].name,
        })),
      };
    } catch (err) {
      throw new RpcException(err as RpcError);
    }
  }

  async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const { page, limit, status } = paginationAndFilterDto;

    const total = await this.prismaService.order.count({ where: { status } });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.prismaService.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status },
      }),
      meta: {
        page,
        limit,
        total,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throwRpcException(HttpStatus.NOT_FOUND, 'Order not found.');
    }

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);

    if (order?.status === status) {
      return order;
    }

    return this.prismaService.order.update({
      where: { id },
      data: { status },
    });
  }
}
