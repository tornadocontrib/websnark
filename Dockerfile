FROM node:22.11.0-alpine3.20@sha256:b64ced2e7cd0a4816699fe308ce6e8a08ccba463c757c00c14cd372e3d2c763e

WORKDIR /workspace/

# cache dependencies
COPY ./package.json ./package-lock.json /workspace/
RUN npm install --ignore-scripts --trace-warnings

COPY index.js main.js /workspace/
COPY ./src/ /workspace/src/
COPY ./tools/ /workspace/tools/
COPY ./test/ /workspace/test/
COPY ./example/ /workspace/example/
RUN mkdir /workspace/build/
RUN npm run build
RUN node --test
RUN npx --no esbuild index.js --bundle --platform=browser --format=esm --outfile=bundle.mjs
