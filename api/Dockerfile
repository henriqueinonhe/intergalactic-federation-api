FROM node:lts-alpine

WORKDIR /home/app

COPY . .

RUN npm ci
RUN npx tsc -p .

EXPOSE 80
EXPOSE 443

CMD ["node", "./dist/index.js"]