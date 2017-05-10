#Alpine docker image with ffmpeg and node inside...dependencies for bert-bot
FROM node:6.10.3-alpine
MAINTAINER rdsmallwood928@gmail.com

ENV FFMPEG_VERSION=3.0.2

WORKDIR /bertbot

COPY ./ /bertbot

RUN apk add --no-cache --update build-base curl nasm tar bzip2 \
  zlib-dev yasm-dev lame-dev libogg-dev x264-dev \
	libvpx-dev libvorbis-dev x265-dev freetype-dev libass-dev \
	libwebp-dev rtmpdump-dev libtheora-dev opus-dev && \

  #Add ffmpeg
	mkdir /tmp/ffmpeg && cd /tmp/ffmpeg && \
  DIR=$(mktemp -d) && cd ${DIR} && \

  curl -s http://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.gz | tar zxvf - -C . && \
  cd ffmpeg-${FFMPEG_VERSION} && \
 	./configure \
  --enable-version3 --enable-gpl --enable-nonfree --enable-small --enable-libmp3lame --enable-libx264 --enable-libx265 --enable-libvpx --enable-libtheora --enable-libvorbis --enable-libopus --enable-libass --enable-libwebp --enable-librtmp --enable-postproc --enable-avresample --enable-libfreetype --enable-openssl --disable-debug && \
  make && \
  make install && \
  make distclean && \

	#install bertbot
	cd /bertbot && npm install && \

  #Clean up
  rm -rf ${DIR} && \
  apk del build-base curl tar bzip2 x264 openssl nasm make gcc g++ python linux-headers binutils-gold libstdc++ gnupg && \
  rm -rf /var/cache/apk/* && \
  rm -rf /usr/include /node-${NODE_VERSION}* /usr/share/man /tmp/* /var/cache/apk/* \
    /root/.npm /root/.node-gyp /root/.gnupg /usr/lib/node_modules/npm/man \
    /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html /usr/lib/node_modules/npm/scripts

CMD ["node","src/app.js"]
