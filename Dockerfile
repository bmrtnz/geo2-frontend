FROM node:18
# ENV NODE_ENV=production
ARG ENV

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .
RUN npm ci

# Bundle app source
COPY . .

EXPOSE 4200
CMD ng serve --open --live-reload=false --configuration=${ENV}
