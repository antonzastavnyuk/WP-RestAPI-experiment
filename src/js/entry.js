var publicationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/publications/';
var postsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/posts/';
var presentationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/presentations/';
$('.wrapper').append('<ul />');
$('ul').addClass('social-media__list');

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


function render(value) {
  var postTypeClass;
  var date = new Date(value[0]);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDay();

  if (value[5] === 'publications') {
    postTypeClass = ' social-media__item-content--publications';
  } else if (value[5] === 'presentations') {
    postTypeClass = ' social-media__item-content--tweet';
  } else if (value[5] === 'post') {
    postTypeClass = ' social-media__item-content--post';
  }
  var renderStr = '<ul class="social-media__list"><li class="social-media__item" ><div class="social-media__item-content' + postTypeClass + '"><div class="social-media__item-description"><div class="social-media__item-image-container" style="height: 89px;"><img src="' + value[4] + '" style="height: 100%;"></div><div class="social-media__item-title-container"><p>' + value[1] + '</p><span class="social-media__item-author">' + value[2] + '</span></div></div><div class="social-media__item-meta"><a class="social-media__item-link" href="' + value[4] + '" target="_blank">view</a><span class="social-media__item-date">' + year + '.' + day + '.' + month + '</span></div></div></li></ul>';
  $('.wrapper').append(renderStr);
}

var publicationsResult = getData(publicationsUrl);
var presentationsResult = getData(presentationsUrl);
var postsResult = getData(postsUrl);

Promise.all([publicationsResult, presentationsResult, postsResult])
.then(function (allResults) {
  var allResultsConcat = allResults.reduce(function (a, b) {
    return a.concat(b);
  });

  allResultsConcat.sort(function (a, b) {
    return (new Date(b.date)).getTime() - (new Date(a.date)).getTime();
  });

  allResultsConcat.forEach(function (item) {
    var author;
    var pdf;
    var finalResult;
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

    getData(imageHref)
    .then(function (data) {
      return data.source_url;
    }, function (data) {
      return data;
    })
    .then(function (result) {
      finalResult = [
        item.date,
        item.title.rendered,
        author,
        pdf,
        result,
        item.type];

      render(finalResult);
    });
  });
});
