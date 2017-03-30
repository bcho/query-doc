const request = require('superagent');
const cheerio = require('cheerio');

function queryUrl(query) {
  const nsAndVar = query.split('/');

  if (nsAndVar.length === 1) {
    nsAndVar.unshift('clojure.core');
  }

  return `https://clojuredocs.org/${nsAndVar.join('/')}`;
}

module.exports = (query) => {
  return new Promise((resolve, reject) => {
    request
      .get(queryUrl(query))
      .end((err, res) => {
        if (err) {
          reject(err);
          return;
        }

        if (!res.ok) {
          reject(res.status);
          return;
        }

        const $ = cheerio.load(res.text);
        const varName = $('.var-name').text();
        const argLists = $('li.arglist').map((_, el) => $(el).text()).get();
        const docString = $('.docstring pre').text();
        const formatted = [
          varName,
          '',
          '',
          argLists.join('\n'),
          '',
          '',
          docString,
        ].join('\n');

        resolve({
          varName,
          argLists,
          docString,
          formatted,
        })
      });
  });
};
