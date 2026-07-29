type ResolveLogoUrl = (logoUrl: string, gotOpts?: import('got').Options) => Promise<string | undefined>

type Options = {
  /**
   * https://github.com/sindresorhus/got#options
   */
  gotOpts?: import('got').Options,

  /**
   * https://github.com/microlinkhq/keyv/tree/master/packages/memoize#keyvoptions
   */
  keyvOpts?: import('@keyvhq/core').Options<any>,

  /**
   * It will be used to determine if the logo URL published in the BIMI record
   * is valid.
   */
  resolveLogoUrl?: ResolveLogoUrl,

  /**
   * The DNS resolver used to read the TXT record, matching the signature of
   * `dns.promises.resolveTxt`. Provide your own to run over DNS over HTTPS.
   * @default require('dns').promises.resolveTxt
   */
  resolveTxt?: (hostname: string) => Promise<string[][]>,

  /**
   * The BIMI selector to query, used as `<selector>._bimi.<domain>`.
   * @default 'default'
   */
  selector?: string
}

/**
 * Creates a resolver for the logo a domain publishes in its BIMI record,
 * memoized per hostname queried.
 */
declare function createGetLogo (options?: Options): (domain: string) => Promise<string | undefined>;

declare namespace createGetLogo {
  const resolveLogoUrl: ResolveLogoUrl;

  /**
   * Reads the served URL out of a response, or `undefined` when it is not a
   * reachable SVG over https.
   */
  function toLogoUrl (response: {
    statusCode: number,
    url: string,
    headers: Record<string, string | undefined>
  }): string | undefined;
}

export = createGetLogo;
