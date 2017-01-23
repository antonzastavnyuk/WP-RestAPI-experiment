function getData(url) {
  return new Promise(function (resolve) {
    jQuery.ajax({
      url: url,
      type: 'get',
      dataType: 'JSON',
      success: function (data) {
        resolve(data);
      },
      statusCode: {
        403: function () {
          resolve('403');
          // reject('403');
        }
      }
    });
      // TODO: add method if error
  });
}

function handlebarsRender(value) {
  var source = $('#entry-template').html();
  var template = Handlebars.compile(source);

  Handlebars.registerHelper('postTypeClass', function (type) {
    return ' social-media__item-content--' + type;
  });

  Handlebars.registerHelper('dateFormat', function (dateIn) {
    var date = new Date(dateIn);
    var year = String(date.getFullYear());
    var month = date.getMonth();
    var day = date.getDate();
    return month + '.' + day + '.' + year.substr((year.length - 2), 2);
  });

  $('.wrapper').append(template(value));
}

var publicationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/publications/';
var postsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/posts/';
var presentationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/presentations/';

var publicationsResult = getData(publicationsUrl);
var presentationsResult = getData(presentationsUrl);
var postsResult = getData(postsUrl);

Promise.all([publicationsResult, presentationsResult, postsResult]).then(function (allResults) {
  // console.log(allResults);
  var allResultsConcat = allResults.reduce(function (a, b) {
    return a.concat(b);
  });

  allResultsConcat.sort(function (a, b) {
    return (new Date(b.date)).getTime() - (new Date(a.date)).getTime();
  });

  var readyResults = {};
  readyResults.items = [];
  var image = [];

  allResultsConcat.forEach(function (item) {
    var author;
    var pdf;
    var imageHref = item._links['wp:featuredmedia'][0].href;


    if (item.type === 'publications') {
      author = item.acf.pb_authors_meta;
      pdf = item.acf.pb_pdf_file;
    } else if (item.type === 'presentations') {
      author = item.acf.pt_author[0].post_title;
      pdf = item.acf.pt_pdf_file;
    } else if (item.type === 'post') {
      author = '';
      pdf = '';
    }

    readyResults.items.push({
      date: item.date,
      title: item.title.rendered,
      author: author,
      documentLink: pdf,
      itemType: item.type
    });

    image[image.length] = getData(imageHref);
  });

  Promise.all(image).then(function (img) {
    readyResults.items.forEach(function (item, i) {
      if (img[i] !== '403') {
        readyResults.items[i].imageHref = img[i];
      } else {
        readyResults.items[i].imageHref = false;
      }
      $('.loader').toggleClass('loaded');
    });
    handlebarsRender(readyResults);
  });
});
