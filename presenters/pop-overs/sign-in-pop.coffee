# called by header and recent-projects
# TODO should return node, instead of requiring .template()

SignInPopTemplate = require "../../templates/pop-overs/sign-in-pop"

module.exports = (application) ->

  self =
  
    githubAuthLink: ->
      clientId = "65efbd87382354ca25e7"
      scope = "user:email"
      redirectUri = encodeURIComponent "#{APP_URL}login/github"
      "https://github.com/login/oauth/authorize?client_id=#{clientId}&scope=#{scope}&redirect_uri=#{redirectUri}"

    facebookAuthLink: ->
      clientId = "1858825521057112"
      scopes="email"
      callbackURL = encodeURIComponent "#{APP_URL}login/facebook"
      "https://www.facebook.com/v2.9/dialog/oauth?" +
        "client_id=#{clientId}&scope=#{scopes}&redirect_uri=#{callbackURL}"

    template: ->
      SignInPopTemplate self

    stopPropagation: (event) ->
      event.stopPropagation()
