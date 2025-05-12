FROM node:22-alpine3.21

ENV DATABASE_URL="postgresql://admin:1234@localhost:5432/microsrv_order?schema=public"
ENV NATS_SERVERS="nats://localhost:4222"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]
