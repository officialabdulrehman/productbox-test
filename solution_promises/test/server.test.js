const request = require("supertest");
const { server } = require('../src/app');

describe("API", () => {

  describe("GET /I/want/title", () => {
    it("should return 200 OK", async () => {
      const url = "/I/want/title?address=https://github.com/officialabdulrehman&address=dawn.com/events/&address=dfsdf"
      const actual = await request(server).get(url)
        .expect(200)
        .expect("Content-Type", "text/html");
      const expected = `<html><head><title>Localhost</title></head><body><h1>Following are the titles of given websites:</h1><ul><li>https://github.com/officialabdulrehman - "officialabdulrehman (Abdul Rehman Nizamani) · GitHub"</li><li>https://www.dawn.com/events/ - "Events - DAWN.COM - DAWN.COM"</li><li>https://www.dfsdf - "NO RESPONSE"</li></ul></body></html>`
      expect(actual.text).toEqual(expected)
    });
  });

  describe("GET /I/want/something-else", () => {
    it("should return 200 OK", async () => {
      const url = "/I/want/something-else"
      const actual = await request(server).get(url)
        .expect(404)
        .expect("Content-Type", "text/html");
      const expected = `<html><head><title>404 - Not found</title></head><body><h1>404 - Not found</h1></body></html>`
      expect(actual.text).toEqual(expected)
    });
  });

});