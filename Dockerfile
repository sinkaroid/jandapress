FROM node:latest
WORKDIR /srv/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run postinstall
EXPOSE 3000
CMD ["node", "build/src/index.js"]