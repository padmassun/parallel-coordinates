FROM alpine:3.5

ENV BUILD_PACKAGES bash curl-dev ruby-dev build-base sqlite-dev tar nodejs
ENV RUBY_PACKAGES ruby ruby-io-console ruby-bundler
ENV RUBY_GEMS  bundler rubygems-bundler sqlite3 json

# Update
RUN apk update && \
	apk upgrade && \
	apk add $BUILD_PACKAGES && \
	apk add $RUBY_PACKAGES && \
	gem install --no-rdoc --no-ri $RUBY_GEMS  && \
	rm -rf /var/cache/apk/*

RUN mkdir -p /dataviz/src

WORKDIR /dataviz

ADD ./src/package.json /dataviz/src/

RUN cd ./src && pwd && ls && npm install

EXPOSE  8080
CMD ["node", "server.js"]
