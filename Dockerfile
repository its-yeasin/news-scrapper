FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY . .

EXPOSE 4001

CMD ["node", "index.js"]