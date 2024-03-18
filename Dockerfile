FROM node:21-alpine as build

# update and install the latest dependencies for the alpine version
RUN apk update && apk upgrade

# set work dir as app
WORKDIR /app

# install all the project npm dependencies
RUN  npm install pnpm -g

# copy all other project files to working directory
COPY . ./

# install all the project npm dependencies
RUN  pnpm install

ENV NODE_ENV=production

# build the nuxt project to generate the artifacts in .output directory
RUN pnpm build

# we are using multi stage build process to keep the image size as small as possible
FROM node:21-alpine

# update and install latest dependencies, add dumb-init package
# add a non root user
RUN apk update && apk upgrade && apk add dumb-init && adduser -D nuxtuser 

# set non root user
USER nuxtuser

# set work dir as app
WORKDIR /app

# copy the output directory to the /app directory from 
# build stage with proper permissions for user nuxt user
COPY --chown=nuxtuser:nuxtuser --from=build /app/.output ./
#COPY --from=build /app/.output ./

# copy prisma migration files
COPY --chown=nuxtuser:nuxtuser --from=build /app/prisma ./prisma

# expose 5000 on container
EXPOSE 5000

# Create Entrypoint bash script
RUN echo "#!/bin/sh" > /app/entrypoint.sh
RUN echo "npx prisma migrate deploy" >> /app/entrypoint.sh
RUN echo "dumb-init node /app/server/index.mjs" >> /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# set entrypoint to run the app
ENTRYPOINT ["/app/entrypoint.sh"]

# start the app with dumb init to spawn the Node.js runtime process
# with signal support
# CMD ["dumb-init","node","/app/server/index.mjs"]
#ENTRYPOINT ["node", "/output/server/index.mjs"]