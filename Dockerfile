#Alpine docker image with ffmpeg and node inside...dependencies for bert-bot
FROM node:12-stretch
MAINTAINER rdsmallwood928@protonmail.com


WORKDIR /bertbot

COPY ./ /bertbot

RUN apt-get update && apt-get install -y ffmpeg && npm install

ENTRYPOINT ["node"]

CMD ["src/app.js"]
