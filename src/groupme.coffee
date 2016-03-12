Adapter         = require('hubot').Adapter
TextMessage     = require('hubot').TextMessage
User            = require('hubot').User
Api             = require('groupme').Stateless
Promise         = require('bluebird')

class GroupMeAdapter extends Adapter
  constructor: (robot) ->
    super robot
    @robot.logger.info 'Initialize GroupMe Adapter'
  
    @max_len = 1000
    @token = process.env.HUBOT_GROUPME_TOKEN
    @bot_id = process.env.HUBOT_GROUPME_BOT_ID

  run: ->
    @robot.logger.info 'Run GroupMe Adapter'

    Promise.promisify(Api.Bots.index)(@token)
    .then (bots) =>
      bot = (bot for bot in bots when bot.bot_id == @bot_id)[0]
      Promise.promisify(Api.Groups.show)(@token, bot.group_id)
    .then (group) =>
      for user in group.members
        user.room = group.id
        user.name = user.nickname
        delete user.id
        @robot.brain.userForId(user.user_id, user)
    .then =>
      @robot.router.post '/hubot/incoming', (req, res) =>
        if req.body.sender_type != 'bot'
          user = @robot.brain.userForId(req.body.user_id)
          @receive new TextMessage user, req.body.text, req.body.id
        res.writeHead 200, 'Content-Type': 'text/plain'
        res.end()

      @robot.logger.info "Connected to GroupMe"
      @emit 'connected'
    .then null, (err) =>
      @robot.logger.error err
    .done()

  send: (envelope, strings...) ->
    @chunkStrings(strings...).reduce((acc, item) =>
      acc
      .then =>
        Promise.promisify(Api.Bots.post)(@token, @bot_id, item, {})
      .then ->
        Promise.delay(1000)
    , Promise.delay(2000))
    .then null, (err) =>
      @robot.logger.error err
    .done()

  reply: (envelope, strings...) ->
    @send envelope, "@#{envelope.user.name} #{strings[0]}", strings[1..]...

  topic: (envelope, strings...) ->
    @send envelope, "/topic #{strings[0]}"

  chunkStrings: (strings...) ->
    line_num = 0
    space_left = @max_len
    result = [""]

    wrap_with = (token, delimiter) ->
      string = token + delimiter
      if string.length > space_left
        result[++line_num] = ""
        space_left = @max_len - string.length
      else
        space_left -= string.length
      result[line_num] += string

    for string in strings
      for line in string.split('\n')
        if line.length > @max_len
          wrap_with(word, ' ') for word in line.split(' ')
        else
          wrap_with(line, '\n')
    str.trim() for str in result

exports.use = (robot) ->
  new GroupMeAdapter robot
