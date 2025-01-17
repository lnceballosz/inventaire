// SPDX-FileCopyrightText:  2014  Maxime Lathuilière, Vincent Jumeaux
// SPDX-License-Identifier: AGPL-3.0-only

// Production config
// This config file will be used if: NODE_ENV=production
// Override locally in ./local-production.js

module.exports = {
  env: 'production',
  verbose: true,
  publicHost: 'OVERRIDE',
  publicProtocol: 'https',
  fullPublicHost: function () {
    return `${this.publicProtocol}://${this.publicHost}`
  },
  // Let Nginx serve the static files
  // https://github.com/inventaire/inventaire-deploy/blob/master/nginx/inventaire.original.nginx
  serveStaticFiles: false,
  db: {
    username: 'OVERRIDE',
    password: 'OVERRIDE',
    suffix: 'prod',
  },
  logMissingI18nKeys: false,
  mailer: {
    disabled: false,
    preview: false
  },
  activitySummary: {
    disabled: false
  },
  // Let the alt instance run the jobs
  jobs: {
    'inv:deduplicate': {
      run: false
    }
  }
}
