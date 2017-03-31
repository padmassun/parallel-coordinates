FROM alpine:3.5

ENV BUILD_PACKAGES bash curl-dev ruby-dev build-base nodejs
ENV RUBY_PACKAGES ruby ruby-io-console ruby-bundler
ENV RUBY_GEMS  bundler rubygems-bundler zlib base64 csv fileutils optparse yaml sqlite3 json

# Update
RUN apk update && \
	apk upgrade && \
	apk add $BUILD_PACKAGES && \
	apk add $RUBY_PACKAGES && \
	gem install $RUBY_GEMS --no-rdoc --no-ri && \
	rm -rf /var/cache/apk/*

# Install app dependencies
COPY /src/package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY ./src .

EXPOSE  8080
CMD ["node", "server.js"]