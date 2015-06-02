# hubot-groupme-webhook
[![npm](https://img.shields.io/npm/v/hubot-groupme-webhook.svg)](https://www.npmjs.com/package/hubot-groupme-webhook)

Groupme adapter for hubot that uses the Groupme bot callback url instead of polling or using the push API

## Installation

In your hubot repo, run:
`npm install --save hubot-groupme-webhook`

## Running
To use this adapter run hubot with the adapter argument

`./bin/hubot -a groupme-webhook`

Or set the adapter environment variable

`export HUBOT_ADAPTER="groupme-webhook"`

### Configuration

Three environment variables must be set:

* `HUBOT_GROUPME_GROUP_ID`: a GroupMe group ID
* `HUBOT_GROUPME_TOKEN`: a GroupMe access token
* `HUBOT_GROUPME_BOT_ID`: a GroupMe bot ID
