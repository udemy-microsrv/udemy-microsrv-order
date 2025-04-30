import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PrismaService } from '../prisma.service';
import { createRpcException } from '../common/exceptions/create-rpc-exception';
import { PaginationAndFilterDto } from './dto/pagination-and-filter.dto';
import { MICROSRV_PRODUCT } from '../config/microservices.token';
import { firstValueFrom, map } from 'rxjs';
import { RpcError } from '../common/exceptions/rpc-error';
import { Product, ProductDict } from './types/product.type';

@Injectable()
export class OrdersService {
  constructor(
    private prismaService: PrismaService,
    @Inject(MICROSRV_PRODUCT) private productClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const products = await this.findManyProducts(
        createOrderDto.items.map((item) => item.productId),
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

    if (!order) {
      throw createRpcException(HttpStatus.NOT_FOUND, 'Order not found.');
    }

    try {
      const products = await this.findManyProducts(
        order.OrderItem.map((item) => item.productId),
      );

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

  /**
   * @throws {RpcError}
   */
  private findManyProducts(ids: number[]) {
    return firstValueFrom(
      this.productClient.send({ cmd: 'product.find_many' }, { ids }).pipe(
        map(
          (products: Product[]): ProductDict =>
            products.reduce((acc, product) => {
              acc[product.id] = product;
              return acc;
            }, {}),
        ),
      ),
    );
  }
}
