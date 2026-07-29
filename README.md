# bimi-url

![Last version](https://img.shields.io/github/tag/kikobeats/bimi-url.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/kikobeats/bimi-url.svg?style=flat-square)](https://coveralls.io/github/kikobeats/bimi-url)
[![NPM Status](https://img.shields.io/npm/dm/bimi-url.svg?style=flat-square)](https://www.npmjs.org/package/bimi-url)

> Get a logo from BIMI DNS record

## Why

[BIMI](https://datatracker.ietf.org/doc/draft-blank-ietf-bimi/) is the standard behind the brand logo mailbox providers show next to an email. Domains publish it as a TXT record:

```bash
$ dig +short TXT default._bimi.microlink.io
"v=BIMI1; l=https://cdn.microlink.io/logo/logo.svg;"
```

The specification constrains the logo to [SVG Tiny P/S](https://www.w3.org/TR/SVGTiny12/): vector, square, and transparent, which is exactly the shape a logo is expected to have.

The record is published in the domain's own DNS, so it is self asserted: the same level of trust as `og:logo`. Domains may also publish a Verified Mark Certificate under `a=`, where a certificate authority has attested the mark against the trademark owner, but this package does not read or validate it, so treat the result as a BIMI published logo rather than a verified one.

That makes it a higher quality source than a favicon, and it doesn't need the markup: a single DNS lookup, so it works even when the page is JavaScript rendered or unreachable.

Coverage is the trade-off. It's common among large brands and rare in the long tail, so pair it with another source.

## Install

```bash
$ npm install bimi-url --save
```

## Usage

```js
const createGetLogo = require('bimi-url')

const getLogo = createGetLogo()

const main = async () => {
  console.log(await getLogo('shopify.com'))
  // => 'https://vmc.digicert.com/8833b699-1227-41ee-b185-cc2d9a08e213.svg'

  console.log(await getLogo('example.com'))
  // => undefined
}
```

The lookup is done against the registrable domain, meaning `blog.example.com` has to be passed as `example.com`.

It never rejects: a domain without a record, a logo that can't be fetched, and a DNS failure all resolve as `undefined`.

## API

### createGetLogo([options])

Returns a `getLogo(domain)` function, memoized per hostname queried.

#### options

##### gotOpts

Type: `object`

Any option to be passed to [got](https://github.com/sindresorhus/got#options) when the logo URL is checked.

##### keyvOpts

Type: `object`

Any option to be passed to [@keyvhq/memoize](https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions).

The resolution is memoized per hostname, including the absence of a record. A resolver failure is not cached, so it is retried on the next call.

The default store is an in-memory map that never evicts, so a long running process resolving many domains should supply its own store, plus a `ttl` in milliseconds to bound how long a record is trusted:

```js
const KeyvRedis = require('@keyvhq/redis')
const createGetLogo = require('bimi-url')

const getLogo = createGetLogo({
  keyvOpts: {
    store: new KeyvRedis('redis://localhost:6379'),
    ttl: 24 * 60 * 60 * 1000
  }
})
```

##### resolveLogoUrl

Type: `function`<br>
Default: `require('bimi-url').resolveLogoUrl`

It determines if the logo URL published in the record is valid, returning the URL or `undefined`.

The default implementation discards anything not reachable, not served as `image/svg+xml`, or that redirects away from `https`.

##### resolveTxt

Type: `function`<br>
Default: `require('dns').promises.resolveTxt`

The DNS resolver used to read the TXT record. Provide your own to run the lookup over [DNS over HTTPS](https://datatracker.ietf.org/doc/html/rfc8484) on runtimes without access to `node:dns`:

```js
const createGetLogo = require('bimi-url')

const getLogo = createGetLogo({
  resolveTxt: async hostname => {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${hostname}&type=TXT`,
      { headers: { accept: 'application/dns-json' } }
    )
    const { Answer = [] } = await response.json()
    return Answer.filter(({ type }) => type === 16).map(({ data }) =>
      data.match(/"[^"]*"/g).map(chunk => chunk.slice(1, -1))
    )
  }
})
```

##### selector

Type: `string`<br>
Default: `'default'`

The BIMI selector to query, used as `<selector>._bimi.<domain>`.

## License

**bimi-url** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/kikobeats/bimi-url/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/kikobeats/bimi-url/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/kikobeats) · Twitter [@kikobeats](https://twitter.com/kikobeats)
