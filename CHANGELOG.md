# Yalc changelog

## 1.0.0.pre.8

## 1.0.0.pre.7 (2017-05-11)
- fixes files inclusion (#2)

## 1.0.0.pre.6 (2017-05-09)
- fixed `yarn.lock` bug

## 1.0.0.pre.5 (2017-05-07)
- copy to dest package dir not removing inner `node_modules`

## 1.0.0.pre.4 (2017-05-02)
- do not publish standard non-code files (README, LICENCE, etc.)
- remove lockfile and .yalc dir if empty

## 1.0.0.pre.3 (2017-04-28)
- use .gitignore if no `files` entry in manifest

## 1.0.0.pre.2 (2017-04-26)

- `remove` removes from `.yalc` and `node_modules`
- fixed installtion file write bug when publish
- handle `files` field in manifest

## 1.0.0.pre.1 (2017-04-25)

- fixed installation file first read
- `check` command
- `remove` and `retreat` commands

## 1.0.0.pre.0 (2017-04-23)
- publish, push, add, update