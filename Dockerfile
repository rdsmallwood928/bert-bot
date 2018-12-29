#Alpine docker image with ffmpeg and node inside...dependencies for bert-bot
FROM rdsmallwood928/bert-bot-base:latest
MAINTAINER rdsmallwood928@protonmail.com

WORKDIR /bertbot

COPY ./ /bertbot

RUN npm install

CMD ["src/app.js"]
