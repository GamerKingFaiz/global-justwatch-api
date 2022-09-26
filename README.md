# Unofficial Global JustWatch API

Find what services are streaming your favorite media around the world!

This API allows searching for media on JustWatch and seeing seeing the results from all available countries.

## Disclaimer

The following is copied from a JustWatch employee's [PR](https://github.com/lufinkey/node-justwatch-api/pull/11) in another repo.

> This is not the official JustWatch API. JustWatch doesn't offer an open API and doesn't plan to do this in the future.
>
> The work of many developers went and is still going into the development and maintenance of the data and the API. JustWatch's main business is to operate a [streaming guide](https://www.justwatch.com/) with apps for iOS and Android. They offer the data for business intelligence and marketing. Therefore it is prohibited to use the API for commercial use (consumer service, data science, business intelligence, etc.). It is ok to use the API for private projects, but please be respectful with your API calls to not put too much load on the API. The API is not supported in any way and will change frequently without warning.
>
> If you would like to work with JustWatch and use the data/API please get in contact with them via [info@justwatch.com](mailto:info@justwatch.com). Currently, JustWatch can only work with bigger partners and clients.
> JustWatch is also hiring: https://www.justwatch.com/us/talent and has some interesting open source projects:
>
> - [JustWatch on Github](https://github.com/justwatchcom)
> - [GoPass Password Manager](https://github.com/gopasspw/gopass)

## Endpoints

### `/search`

This endpoint returns the most popular media in the US at the moment.

### `/search/:query`

This endpoint takes a search input and returns the results.

### `/title/:type/:titleId`

The bread and butter of this API.  
This endpoint returns a title's `metadata` and `offers` (the services it's streaming on in each country).

### `/providers`

Returns all locales and their streaming services.  
Only used to update [allLocalesAndProviders.json](./allLocalesAndProviders.json) every so often.

## Local Development

### Prerequisites

Node.js, which includes npm, must be installed.  
https://nodejs.org/en/download/

### Instructions

This app runs an Express server.

1. Create a copy of `.env.example` in the root directory
   1. Rename the copy to just `.env`
   1. Add any hosts you need to allow access to this API (e.g. `http://localhost:3000`, if you're running this with the [associated front end project](https://github.com/GamerKingFaiz/global-justwatch))
1. Run `npm start`
   1. A dev server will be started (this means any time you make changes the server automatically restarts with your latest changes)
