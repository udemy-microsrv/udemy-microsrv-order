export default () => ({
  transport: {
    nats: {
      servers: process.env.NATS_SERVERS?.split(','),
    },
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});
