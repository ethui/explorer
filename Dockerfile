FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable yarn && yarn i --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
