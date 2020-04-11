const CONFIG = require('config')
const __ = CONFIG.universalPath
const _ = __.require('builders', 'utils')
const error_ = __.require('lib', 'error/error')
const getEntityByUri = __.require('controllers', 'entities/lib/get_entity_by_uri')
const getEntitiesList = __.require('controllers', 'entities/lib/get_entities_list')

module.exports = async item => {
  const { entity: uri } = item
  const entity = await getEntityByUri({ uri })

  let works
  if (entity.type === 'edition') {
    item.edition = entity
    item.publisherUri = entity.claims['wdt:P123'] && entity.claims['wdt:P123'][0]
    if (item.publisherUri) {
      item.publisher = await getEntityByUri({ uri: item.publisherUri })
    }
    item.worksUris = entity.claims['wdt:P629']
    works = await getEntitiesList(item.worksUris)
  } else if (entity.type === 'work') {
    item.worksUris = [ uri ]
    works = [ entity ]
  } else {
    // Known case: if an item is associated to an Wikidata entity which type was changed
    throw error_.new('invalid item entity type', 500, { item, entity })
  }

  item.works = works
  item.authorsUris = _.deepCompact(works.map(getWorkAuthorsUris))
  item.seriesUris = _.deepCompact(works.map(getWorkSeriesUris))
  item.genresUris = _.deepCompact(works.map(getWorkGenresUris))

  const [ authors, series, genres ] = await Promise.all([
    getEntitiesList(item.authorsUris),
    getEntitiesList(item.seriesUris),
    getEntitiesList(item.genresUris)
  ])

  item.authors = authors
  item.series = series
  item.genres = genres

  return item
}

const getWorkSeriesUris = work => work.claims['wdt:P179']
const getWorkGenresUris = work => work.claims['wdt:P136']
const getWorkAuthorsUris = work => _.flatten(_.values(_.pick(work.claims, authorProperties)))
const authorProperties = [
  'wdt:P50',
  'wdt:P58',
  'wdt:P110',
  'wdt:P6338'
]
