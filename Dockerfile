FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable yarn
RUN yarn install --immutable

COPY . .

ENV NODE_ENV=production
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
