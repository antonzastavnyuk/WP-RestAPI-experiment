var publicationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/publications/';
var postsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/posts/';
var presentationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/presentations/';

function getData(url) {
  return new Promise(function (resolve, reject) {
    jQuery.ajax({
      url: url,
      type: 'get',
      dataType: 'JSON',
      success: function (data) {
        resolve(data);
      },
      statusCode: {
        403: function () {
          reject('403');
        }
      }
    });
      // TODO: add method if error
  });
}

function getItem(item) {
  var date = new Date(item.date);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDay();
  var postTypeClass;
  if (item.type === 'publications') {
    postTypeClass = ' social-media__item-content--publications';
  } else if (item.type === 'presentations') {
    postTypeClass = ' social-media__item-content--tweet';
  } else if (item.type === 'post') {
    postTypeClass = ' social-media__item-content--post';
  }

  return [
    '<li class="social-media__item" >',
      '<div class="social-media__item-content' + postTypeClass + '">',
        '<div class="social-media__item-description">',
          '<div class="social-media__item-image-container" style="height: 89px;">',
            '<img src="' + item.image + '" style="height: 100%;">',
          '</div>',
          '<div class="social-media__item-title-container">',
            '<p>' + item.title + '</p>',
            '<span class="social-media__item-author">' + item.author + '</span>',
          '</div>',
        '</div>',
      '<div class="social-media__item-meta">',
        '<a class="social-media__item-link" href="' + item.pdf + '" target="_blank">view</a>',
          '<span class="social-media__item-date">' + year + '.' + day + '.' + month + '</span>',
        '</div>',
      '</div>',
    '</li>'
  ].join('\n');
}


function render(value) {
  var renderedItems = value.map(function (item) {
    return getItem(item);
  });
  // console.log(renderedItems);
  $('<ul/>')
    .append(renderedItems)
  .appendTo('.wrapper');
}

var publicationsResult = getData(publicationsUrl);
var presentationsResult = getData(presentationsUrl);
var postsResult = getData(postsUrl);

Promise.all([publicationsResult, presentationsResult, postsResult]).then(function (allResults) {
  var allResultsConcat = allResults.reduce(function (a, b) {
    return a.concat(b);
  });

  allResultsConcat.sort(function (a, b) {
    return (new Date(b.date)).getTime() - (new Date(a.date)).getTime();
  });

  var readyResults = {};
  readyResults.items = [];
  var image = [];
  var allImages = [];
  var finalResult = [];

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

    allImages.push(getData(imageHref));
    finalResult.push({
      date: item.date,
      title: item.title.rendered,
      author: author,
      pdf: pdf,
      type: item.type
    });
  });

  Promise.all(allImages)
  .then(function (images) {
    var resultsToRender = finalResult.map(function (item, index) {
      return {
        date: item.date,
        title: item.title,
        author: item.author,
        pdf: item.pdf,
        type: item.type,
        image: images[index].source_url,
      };
    });

    render(resultsToRender);
  });
});
