NAME = gnome-shell-bitcoin-markets
UUID = bitcoin-markets@ottoallmendinger.github.com
SCHEMA = org.gnome.shell.extensions.bitcoin-markets.gschema.xml
LANGUAGES = de es pt_BR

all: archive

.PHONY: test
test:
	TS_NODE_PROJECT=./tsconfig.test.json npm test

-include scripts/make/gnome-shell-extension.mk
