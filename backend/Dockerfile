FROM node:22-bookworm

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers and OS dependencies
RUN npx playwright install --with-deps chromium

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# Start the server
CMD ["npm", "start"]
