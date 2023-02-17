FROM cypress/included:cypress-12.6.0-node-16.18.1-chrome-110.0.5481.96-1-ff-109.0-edge-110.0.1587.41-1 as base 
WORKDIR /app
COPY package.json ./
COPY ./ ./
RUN npm install -g npm@8.19.3
RUN npm install 
CMD ["npm", "run", "test:e2e"]