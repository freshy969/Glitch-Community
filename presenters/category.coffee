CategoryTemplate = require "../templates/includes/category"
# ProjectTemplate = require "../templates/includes/project"

ProjectPresenter = require "./project"

module.exports = (application, category) ->

  projectElements = application.projectsInSelectedCategory(category.id).map (project) ->
    # ProjectTemplate(project, category)
    ProjectPresenter(application, project, category)
  
  templateModel = Object.assign {}, category
  templateModel.projects = projectElements
  
  CategoryTemplate templateModel

