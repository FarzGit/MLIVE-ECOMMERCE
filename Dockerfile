
FROM node:18.17.0

COPY package.json /app/

WORKDIR /app

RUN npm install 

CMD ["npm","start"]