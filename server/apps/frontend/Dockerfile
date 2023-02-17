FROM cypress/browsers:node-16.18.1-chrome-110.0.5481.96-1-ff-109.0-edge-110.0.1587.41-1
WORKDIR /app
COPY package.json ./
COPY ./ ./
RUN npm install -g npm@8.19.3
RUN npm ci 
CMD ["npm", "run", "start:server:local"]