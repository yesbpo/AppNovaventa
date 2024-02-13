# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the local frontend directory to the working directory in the container
COPY ./ .

# Install dependencies
RUN npm install

# Migrate prisma
RUN npx prisma db pull
# RUN cd prisma/migrations/ && rm -rf *
# RUN mkdir -p prisma/migrations/0_init
# RUN npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
# RUN npx prisma migrate resolve --applied 0_init

# Build the application
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

EXPOSE 80

# Specify the command to run your application
CMD ["npm", "start"]
