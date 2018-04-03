.PHONY: build

all: dev

dev:
	npm run watch

start: build
	docker-compose up --build

build:
	docker build . -t endaaman/api.endaaman.me

push: build
	docker push endaaman/api.endaaman.me

pull:
	docker pull endaaman/api.endaaman.me
