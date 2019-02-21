## Instakleur

Extracts color palette from Instagram and returns results as an API.

## Running locally
```
npm install
npm run dev
```

## Deploying on Heroku
To deploy on Heroku, you need two buildpacks:

* `heroku/nodejs` Official Nodejs buildpack
* `jontewks/puppeteer` Puppeteer buildpack

This should do the trick:
```
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-nodejs -a YOUR_APP_NAME
heroku buildpacks:add jontewks/puppeteer -a YOUR_APP_NAME
```

## Resources
* [Puppeteer Docs](https://pptr.dev/)
* [node-vibrant](https://github.com/akfish/node-vibrant/)
* [ExpressJS](http://expressjs.com/en/4x/api.html)
