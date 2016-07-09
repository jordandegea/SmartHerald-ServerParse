SHARED NEWS PROJECT : PARSE SERVER
##################################

# Installation

`npm install`

# Deploy

## Requirements

public folder must contains: 
- app: user web app
- dashboard: client web dashboard
- landing: landing page

## Create dist

`make` create the production archive in the folder 'dist'

# Tests

Present in the folder tests

## Installation

`./install.sh`
`composer install`

## Use 

`make parse_test`: start the parse server

then: 

`make`: start all test

`make tests/t.....`: to start a single test



