# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the local frontend directory to the working directory in the container
COPY ./ .

# Install dependencies
RUN npm install

RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

EXPOSE 80

# Specify the command to run your application
CMD ["npx", "next", "dev"]
