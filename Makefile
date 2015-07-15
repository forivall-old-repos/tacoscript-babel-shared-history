MAKEFLAGS = -j1

export NODE_ENV = test

.PHONY: clean test test-cov test-clean test-travis test-browser publish build bootstrap publish-core publish-runtime build-website build-core watch-core build-core-test clean-core prepublish

build: clean
	./scripts/build.sh

build-dist: build
	cd packages/babel; \
	scripts/build-dist.sh
	cd packages/babel-runtime; \
	node scripts/build-dist.js

watch: clean
	scripts/build.sh --watch

lint:
	node node_modules/.bin/eslint packages/*/src

clean: test-clean
	rm -rf coverage
	rm -rf packages/*/lib packages/babel/templates.json

test-clean:
	rm -rf packages/*/test/tmp

test: lint
	./scripts/test.sh
	make test-clean

test-browser:
	./scripts/test-browser.sh

# test-travis: bootstrap lint build test

publish:
	git pull --rebase
	make test
	node scripts/publish.js
	make clean
	./scripts/build-website.sh
# publish: lint
# 	git pull --rebase

# 	make test

# 	read -p "Version: " version; \
# 	npm version $$version --message "v%s"

# 	make build

# 	cp dist/browser.js browser.js
# 	cp dist/browser.min.js browser.min.js

# 	cp dist/polyfill.js browser-polyfill.js
# 	cp dist/polyfill.min.js browser-polyfill.min.js

# 	cp dist/external-helpers.js external-helpers.js
# 	cp dist/external-helpers.min.js external-helpers.min.js

# 	node tools/cache-templates
# 	test -f templates.json

# 	npm publish

# 	git push --follow-tags

# 	make publish-cli
# 	make publish-runtime

# 	rm -rf templates.json browser.js browser.min.js browser-polyfill.js browser-polyfill.min.js external-helpers.js external-helpers.min.js

publish-cli:
	cd packages; \
	node build-cli.js; \
	cd babel-cli; \
	npm publish

bootstrap:
	node scripts/bootstrap.js
