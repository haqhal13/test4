# Use a lightweight Node.js image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install Google Chrome (necessary for Puppeteer)
RUN apt-get update && apt-get install -y wget gnupg2 ca-certificates \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libgbm1 \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxss1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libatk1.0-0 \
    libgtk-3-0 \
    --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the script files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "checkout_automation.js"]
