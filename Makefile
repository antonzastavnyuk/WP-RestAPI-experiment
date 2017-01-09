# wordpress docker-compose makefile
include .env

.PHONY: up

build_prod :
	npm install && ./node_modules/.bin/bower install && ./node_modules/.bin/gulp build --production

build_dev :
	npm install && ./node_modules/.bin/bower install && ./node_modules/.bin/gulp build

run_dev :
	npm install && ./node_modules/.bin/gulp
