
TESTSIMPORT=$(wildcard tests/t*.php)
TESTSPHANTOM=$(TESTSIMPORT:%.php=%)

APPLICATION_ID=com.sinenco.sharednews
MASTER_KEY=themasterkey
INDEX=1
CLOUDFOLDER=$(shell cd ../cloud/ && pwd)

.PHONY: all php_tests finish

# complete test
all: php_tests

php_tests: ${TESTSPHANTOM}

parse_test:
	mongodb-runner start && \
	parse-server --appId ${APPLICATION_ID} --masterKey ${MASTER_KEY} --cloud ${CLOUDFOLDER}/main.js --allowClientClassCreation false --databaseURI "mongodb://localhost/test"

tests/t%: 
	mongodb-runner start && \
	php ./tests/t$*.php 

tests/i%: 
	mongodb-runner start && \
	php ./tests/i$*.php 
	
clean:
	forever stopall && \
	rm ~/.forever/*.log