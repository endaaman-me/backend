FROM ubuntu:16.04

# system
RUN apt-get update
RUN apt-get install -y nginx-extras make g++ nginx curl git supervisor

RUN curl -kL git.io/nodebrew | perl - setup
ENV PATH /root/.nodebrew/current/bin:$PATH
RUN nodebrew install-binary v9.10.1
RUN nodebrew use v9.10.1

# app
ENV NODE_ENV production
WORKDIR /usr/src/app

RUN \
  chown -R www-data:www-data /var/lib/nginx && \
  echo "\ndaemon off;" >> /etc/nginx/nginx.conf && \
  rm /etc/nginx/sites-enabled/default

COPY package*.json /tmp/
RUN cd /tmp && npm --production=false install
RUN cp -a /tmp/node_modules ./

COPY nginx/api.conf /etc/nginx/sites-enabled
COPY nginx/static.conf /etc/nginx/sites-enabled/
COPY supervisor.conf /etc/supervisor/conf.d/

COPY . ./

EXPOSE 80 443
CMD ["/usr/bin/supervisord"]
