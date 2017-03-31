FROM alpine:3.5

ENV BUILD_PACKAGES bash curl-dev ruby-dev build-base sqlite-dev nodejs
ENV RUBY_PACKAGES ruby ruby-io-console ruby-bundler
ENV RUBY_GEMS  bundler rubygems-bundler sqlite3 json

# Update
RUN apk update && \
	apk upgrade && \
	apk add $BUILD_PACKAGES && \
	apk add $RUBY_PACKAGES && \
	gem install --no-rdoc --no-ri $RUBY_GEMS  && \
	rm -rf /var/cache/apk/*

# Install app dependencies
COPY /src/package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY ./src .

#RUN cd /data; ruby btap_osm_and_html_extracter -f qaqc.csv

EXPOSE  8080
CMD ["node", "server.js"]
