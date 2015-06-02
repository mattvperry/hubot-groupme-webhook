Adapter         = require('hubot').Adapter
TextMessage     = require('hubot').TextMessage
User            = require('hubot').User
Api             = require('groupme').Stateless

class GroupMeAdapter extends Adapter
  constructor: (robot) ->
    super robot
    robot.logger.info 'Initialize GroupMe Adapter'

    @token = process.env.HUBOT_GROUPME_TOKEN
    @bot_id = process.env.HUBOT_GROUPME_BOT_ID

  run: ->
    @robot.logger.info 'Run GroupMe Adapter'

    Api.Bots.index.Q(@token)
    .then (bots) =>
      bot = (bot for bot in bots when bot.bot_id == @bot_id)[0]
      @robot.name = bot.name
      Api.Groups.show.Q @token, bot.group_id
    .then (group) =>
      for user in group.members
        user.room = group.id
        user.name = user.nickname
        delete user.id
        @robot.brain.userForId(user.user_id, user)
    .then =>
      @robot.router.post '/hubot/incoming', (req, res) =>
        user = @robot.brain.userForId(req.body.user_id)
        @receive new TextMessage user, req.body.text, req.body.id
        res.writeHead 200, 'Content-Type': 'text/plain'
        res.end()

      @robot.logger.info "Connected to GroupMe"
      @emit 'connected'
    .then null, (err) =>
      @robot.logger.error err

  send: (envelope, strings...) ->
    Api.Bots.post.Q(@token, @bot_id, strings.join('\n'), {})
    .then null, (err) =>
      @robot.logger.error err

  reply: (envelope, strings...) ->
    @send envelope, "@#{envelope.user.name}: #{strings[0]}", strings[1..]...

  topic: (envelope, strings...) ->
    @send envelope, "/topic #{strings[0]}"

exports.use = (robot) ->
  new GroupMeAdapter robot
