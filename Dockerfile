# Use a lightweight Node.js image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install puppeteer-core express

# Copy the script files
COPY . .

# Install Google Chrome (necessary for Puppeteer)
RUN apt-get update && apt-get install -y wget gnupg2 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "checkout_automation.js"]
