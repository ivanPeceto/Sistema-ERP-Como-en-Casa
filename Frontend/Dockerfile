#alpine usa una distro ligera.
FROM node:20-alpine AS build

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 5174

CMD ["npm", "run", "dev"]