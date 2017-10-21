const FB = require('fbgraph')
const axios = require('axios')
const param = require('jquery-param')

// Content
const content = require('./content')
Object.keys(content).forEach(api => {
  exports[api] = content[api]
})
