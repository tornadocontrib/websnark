FROM node:22.11.0-alpine3.20@sha256:b64ced2e7cd0a4816699fe308ce6e8a08ccba463c757c00c14cd372e3d2c763e

WORKDIR /websnark/

# cache dependencies
COPY ./package.json ./package-lock.json /websnark/
RUN npm ci --ignore-scripts

COPY index.js main.js /websnark/
COPY ./src/ /websnark/src/
COPY ./tools/ /websnark/tools/
COPY ./test/ /websnark/test/
COPY ./example/ /websnark/example/
RUN mkdir /websnark/build/
RUN npm run build
RUN node --test
RUN npx --no esbuild index.js --bundle --platform=browser --format=esm --outfile=build/bundle.mjs
