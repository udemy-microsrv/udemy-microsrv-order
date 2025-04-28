export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3002', 10),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  microsrv: {
    product: {
      host: process.env.MICROSRV_PRODUCT_HOST,
      port: process.env.MICROSRV_PRODUCT_PORT,
    },
  },
});
