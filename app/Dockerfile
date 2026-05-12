FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY src ./src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 3000

CMD ["npm", "start"]
