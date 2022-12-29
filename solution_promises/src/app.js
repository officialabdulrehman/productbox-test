const http = require('http');
const url = require('url');

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
      const results = await this.getTitlesForAddresses(addresses)
      this.displayResults(res, results)

      this.endThePositiveResponse(res)
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

  async getTitlesForAddresses(addresses) {
    const promises = addresses.map((address) => {
      const protocol = this.getProtocol(address)
      return new Promise((resolve, reject) => {
        protocol.get(address, (response) => {

          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            const title = this.parseTitle(data)
            resolve({ address, title })
          });

        }).on('error', (error) => {
          if (error) {
            reject({ address, title: "NO RESPONSE" })
          }
        });
      })
    });
    const results = await Promise.all(promises.map(p => p.catch(e => e)));
    console.log(results)
    return results
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

  displayResults(res, results) {
    results.map(({ address, title }) => {
      res.write(`<li>${address} - "${title || 'NO RESPONSE'}"</li>`);
    })
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