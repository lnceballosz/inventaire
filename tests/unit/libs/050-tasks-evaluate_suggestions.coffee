CONFIG = require 'config'
__ = CONFIG.universalPath
_ = __.require 'builders', 'utils'
should = require 'should'
evaluateSuggestions = __.require 'controllers', 'tasks/lib/evaluate_suggestions'

suspect =
  uri: 'inv:00000000000000000000000000000000'
  labels: { en: 'Loic Faujour' }
  claims: { 'wdt:P31': [ 'wd:Q5' ] }

# small title length otherwise merge is possible without occurrences
matchedTitles = [ 'short title' ]

addOccurrence = (suggestion, urls, matchedTitles)->
  urls.map (url)-> suggestion.occurrences.push { url, matchedTitles }

createSuggestions = -> [ uri: 'wd:Q3067358', occurrences: [] ]

shouldMerge = (suggestions, matchedTitles)->
  evaluateSuggestions(suspect, matchedTitles)(suggestions).merge.should.be.ok()

shouldNotMerge = (suggestions, matchedTitles)->
  should(evaluateSuggestions(suspect, matchedTitles)(suggestions).merge).not.be.ok()

describe 'tasks: evaluate suggestions', ->
  it 'should not merge when no suggestions exists', (done)->
    suggestions = []
    shouldNotMerge suggestions, matchedTitles
    done()

  it 'should not merge when no suggestions has occurrences', (done)->
    suggestions = createSuggestions()
    done()

  it 'should not merge when untrustworthy occurrences are passed', (done)->
    urls = [
      'https://fr.wikipedia.org/wiki/Faujour'
      'https://pl.wikipedia.org/wiki/Faujour'
      'https://la.wikipedia.org/wiki/Faujour'
    ]
    suggestions = createSuggestions()
    addOccurrence suggestions[0], urls, matchedTitles

    shouldNotMerge suggestions, matchedTitles
    done()

  it 'should merge when untrusted occurrence exists but suspect and suggestion work titles is long enough', (done)->
    urls = [ 'https://la.wikipedia.org/wiki/Faujour' ]
    suggestions = createSuggestions()
    matchedTitles = [ 'very very long title' ]
    addOccurrence suggestions[0], urls, matchedTitles

    shouldMerge suggestions, matchedTitles
    done()

  it 'should merge and return a Promise when trustworthy occurrences are passed', (done)->
    urls = [
      'http://data.bnf.fr/ark:/12345/cb410608300#about'
      'http://datos.bne.es/resource/XX2052428'
    ]

    suggestions = createSuggestions()
    addOccurrence suggestions[0], urls, matchedTitles

    shouldMerge suggestions, matchedTitles
    done()

  it 'should not merge when several suggestions have occurrences', (done)->
    urls1 = [
      'http://data.bnf.fr/ark:/12345/cb410608300#about'
      'http://datos.bne.es/resource/XX12345'
    ]
    urls2 = [
      'http://data.bnf.fr/ark:/54321/cb410608300#about'
      'http://datos.bne.es/resource/XX54321'
    ]
    suggestions = createSuggestions()
    suggestions.push { uri: 'wd:Q6530', occurrences: [] }
    addOccurrence suggestions[0], urls1, matchedTitles
    addOccurrence suggestions[1], urls2, matchedTitles

    shouldNotMerge suggestions, matchedTitles
    done()

  it 'should not merge when several suggestions match a long title', (done)->
    urls1 = [
      'https://fr.wikipedia.org/wiki/Faujour'
    ]
    urls2 = [
      'https://pl.wikipedia.org/wiki/Stanialas Lem'
    ]
    matchedTitles = [ 'very very long title' ]
    suggestions = createSuggestions()
    suggestions.push { uri: 'wd:Q6530', occurrences: [] }
    addOccurrence suggestions[0], urls1, matchedTitles
    addOccurrence suggestions[1], urls2, matchedTitles

    shouldNotMerge suggestions, matchedTitles
    done()

  it 'should merge when one suggestions have trusted occurrences', (done)->
    urls1 = [
      'http://data.bnf.fr/ark:/12345/cb410608300#about'
      'http://datos.bne.es/resource/XX12345'
    ]
    urls2 = [
      'https://fr.wikipedia.org/wiki/Faujour'
      'https://pl.wikipedia.org/wiki/Faujour'
    ]
    suggestions = createSuggestions()
    suggestions.push { uri: 'wd:Q6530', occurrences: [] }
    addOccurrence suggestions[0], urls1, matchedTitles
    addOccurrence suggestions[1], urls2, matchedTitles

    shouldMerge suggestions, matchedTitles
    done()

  it 'should not merge when two suggestions have trusted occurrences', (done)->
    urls1 = [
      'http://data.bnf.fr/ark:/12345/cb410608300#about'
      'http://datos.bne.es/resource/XX12345'
    ]
    urls2 = [
      'http://data.bnf.fr/ark:/54321/cb410608300#about'
      'http://datos.bne.es/resource/XX54321'
    ]
    suggestions = createSuggestions()
    suggestions.push { uri: 'wd:Q6530', occurrences: [] }
    addOccurrence suggestions[0], urls1, matchedTitles
    addOccurrence suggestions[1], urls2, matchedTitles

    shouldNotMerge suggestions, matchedTitles
    done()

  it 'should not merge when author name is in work title', (done)->
    # known cases : autobiography
    urls = [
      'http://data.bnf.fr/ark:/12345/cb410608300#about'
      'http://datos.bne.es/resource/XX12345'
    ]

    matchedTitles = [ suspect.labels.en ]
    suggestions = createSuggestions()
    addOccurrence suggestions[0], urls, matchedTitles

    shouldNotMerge suggestions, matchedTitles
    done()