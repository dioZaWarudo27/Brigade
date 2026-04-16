import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export class FatSecretOAuth1 {
  private oauth: OAuth;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(consumerKey: string, consumerSecret: string) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });
  }

  // 1. Get Request Token
  async getRequestToken(callbackUrl: string) {
    const requestData = {
      url: 'https://platform.fatsecret.com/rest/server.api',
      method: 'POST',
      data: {
        method: 'oauth.get_request_token',
        oauth_callback: callbackUrl,
      },
    };

    const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData));
    const response = await fetch(`${requestData.url}?format=json`, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data).toString(),
    });

    const text = await response.text();
    // FatSecret returns oauth_token=xxx&oauth_token_secret=yyy
    return new URLSearchParams(text);
  }

  // 2. Exchange Verifier for Access Token
  async getAccessToken(requestToken: string, requestTokenSecret: string, oauthVerifier: string) {
    const requestData = {
      url: 'https://platform.fatsecret.com/rest/server.api',
      method: 'POST',
      data: {
        method: 'oauth.get_access_token',
        oauth_verifier: oauthVerifier,
      },
    };

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData, {
        key: requestToken,
        secret: requestTokenSecret,
      })
    );

    const response = await fetch(`${requestData.url}?format=json`, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data).toString(),
    });

    const text = await response.text();
    return new URLSearchParams(text);
  }

  // 3. General Signed Request (e.g., food_entry.create)
  async signedRequest(method: string, params: any, token: { key: string; secret: string }) {
    const requestData = {
      url: 'https://platform.fatsecret.com/rest/server.api',
      method: 'POST',
      data: {
        method,
        ...params,
        format: 'json',
      },
    };

    const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token));
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data).toString(),
    });

    return await response.json();
  }
}
