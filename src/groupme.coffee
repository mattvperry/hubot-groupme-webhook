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
    wrap_with = (text, seed, delimiter) ->
      if text.length > @max_len
        edge = text.slice(0, @max_len).lastIndexOf(delimiter)
        if edge > 0
          line = text.slice(0, edge)
          remainder = text.slice(edge + 1)
          seed = wrap_with remainder, seed, delimiter
          return [line].concat seed
      return [text].concat seed

    # First pass break on new lines
    result = [].concat (wrap_with(s, [], '\n') for s in strings)...
    # Second pass break on words
    result = [].concat (wrap_with(s, [], ' ') for s in result)...
    # Third pass break on chars
    return [].concat (wrap_with(s, [], '') for s in result)...

exports.use = (robot) ->
  new GroupMeAdapter robot
