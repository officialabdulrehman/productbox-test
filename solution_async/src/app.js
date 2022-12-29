const http = require('http');
const url = require('url');
const async = require('async')

// methods can be read/followed from top to bottom ( Descending Order )

class App {

  serve() {
    return http.createServer(async (req, res) => {
      const isValidRequest = this.apiValidation(req, res)
      if (!isValidRequest) {
        return
      }

      const query = this.parseQuery(req)
      const addresses = this.parseAddresses(query)

      this.startRespondingPostively(res)

      if (!addresses.length) {
        return this.endThePositiveResponse(res)
      }

      this.getTitlesForAddresses(res, addresses)
    })
  }

  apiValidation(req, res) {
    if (!this.isValidRequest(req)) {
      this.handle404(res)
      return false
    }
    return true
  }

  isValidRequest(req) {
    if (req.method === 'GET' && req.url.startsWith('/I/want/title')) {
      return true
    }
    return false
  }

  parseQuery(req) {
    /* 
    2nd arg to url.parse(req.url, true) is slashesDenoteHost which takes a boolean
    slashesDenoteHost: It is a boolean value. 
    If it set to true then the first token after the literal string // and 
    preceding the next / will be interpreted as the host.
    */
    return url.parse(req.url, true).query;
  }

  parseAddresses(query) {
    let addresses = query.address;
    if (!Array.isArray(addresses)) {
      if (addresses) {
        addresses = [addresses];
      } else {
        addresses = []
      }
    }
    if (addresses.length) {
      addresses = addresses.map(address => {
        if (address.startsWith("https") || address.startsWith("http")) {
          return address
        } else if (address.startsWith("www")) {
          return `https://${address}`
        } else {
          return `https://www.${address}`
        }
      })
    }
    return addresses
  }

  startRespondingPostively(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write('<html><head><title>Localhost</title></head><body><h1>Following are the titles of given websites:</h1><ul>');
  }

  getTitlesForAddresses(res, addresses) {
    async.each(addresses, (address, callback) => {
      const protocol = this.getProtocol(address)
      this.handleTheExternalCallToAddress(res, address, protocol, callback)
    }, (error) => {
      this.endThePositiveResponse(res)
    })
  }

  getProtocol(address) {
    let protocol = require('https')
    if (address.startsWith("http://")) {
      protocol = http
    }
    return protocol
  }

  parseTitle(data) {
    /*
      ( - ) <title: This matches the opening tag of the <title> element.
      ( - ) [^>]*: This matches zero or more characters that are not > characters. T
              his is used to skip any attributes that may be included in the <title> element.
      ( - ) >: This matches the > character that follows the opening tag of the <title> element.
      ( - ) ([^<]+): This is a capturing group that matches one or more characters (+) that are not < characters ([^<]). 
              This group is used to capture the contents of the <title> element.
      ( - ) <\/title>: This matches the closing tag of the <title> element. The \/ is used to escape the / character, 
                  since it is also used to indicate the end of the regular expression.
    */
    var title = data.match(/<title[^>]*>([^<]+)<\/title>/); // https://stackoverflow.com/questions/13452865/how-to-get-title-tag-in-a-string-of-html

    if (title) {
      title = title[1]
    }
    return title
  }

  handleTheExternalCallToAddress(res, address, protocol, callback) {
    protocol.get(address, (response) => {

      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const title = this.parseTitle(data)
        res.write(`<li>${address} - "${title || 'NO RESPONSE'}"</li>`);
        callback();
      });

    }).on('error', (error) => {
      res.write(`<li>${address} - NO RESPONSE"</li>`);
      callback(error);
    });
  }

  endThePositiveResponse(res) {
    res.write('</ul></body></html>');
    res.end();
  }

  handle404(res) {
    // Return a 404 for all other routes
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.write('<html><head><title>404 - Not found</title></head><body><h1>404 - Not found</h1></body></html>');
    res.end();
  }

}


const server = new App().serve()

module.exports = { server }