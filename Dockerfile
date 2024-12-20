# Use Node.js base image
FROM node:18

# Install Google Chrome and necessary dependencies
RUN apt-get update && apt-get install -y wget gnupg \
    && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || apt-get install -fy \
    && rm google-chrome-stable_current_amd64.deb

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose the port used by Express
EXPOSE 3000

# Start the application
CMD ["node", "checkout_automation.js"]
