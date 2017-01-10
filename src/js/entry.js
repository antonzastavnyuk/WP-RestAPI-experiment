$('document').ready(function () {
  var $container;
  $('.wrapper').append('<ul />');
  $container = $('ul').addClass('social-media__list');

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
    var title = value[1];
    var $li = $('<li />').attr({ class: 'social-media__item' });
    var $divContent = $('<div />').attr({ class: 'social-media__item-content' });
    var $divDescription = $('<div />').attr({ class: 'social-media__item-description' });
    var $divMeta = $('<div />').attr({ class: 'social-media__item-meta' });
    var $divImageContainer = $('<div />').attr({ class: 'social-media__item-image-container', style: 'height: 89px;' });
    var $divTitleContainer = $('<div />').attr({ class: 'social-media__item-title-container' });
    var $autorsMeta = $('<span />').attr({ class: 'social-media__item-author' }).html(value[2]);
    var $linkItem = $('<a />').attr({ class: 'social-media__item-link', href: value[3], target: '_blank' }).html('view');
    var date = new Date(value[0]);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDay();
    var $itemDate = $('<span />').attr({ class: 'social-media__item-date' }).html(year + '.' + day + '.' + month);
    $container.append($li);
    $li.append($divContent);
    $divContent.append($divDescription).append($divMeta);
    if (value[5] === 'publications') {
      // alert(value[5]);
      $divContent.addClass('social-media__item-content--publications');
    } else if (value[5] === 'presentations') {
      $divContent.addClass('social-media__item-content--tweet');
    } else if (value[5] === 'post') {
      $divContent.addClass('social-media__item-content--post');
    }
    if (value[4] !== '403') {
      var img = $('<img />', { src: value[4], style: 'height: 100%;' });
      $divDescription.append($divImageContainer).append($divTitleContainer);
      $divImageContainer.append(img);
    } else {
      $divDescription.append($divTitleContainer);
    }
    $divTitleContainer.append('<p>' + title + '</p>').append($autorsMeta);
    $divMeta.append($linkItem).append($itemDate);
  }

  var publicationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/publications/';
  var postsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/posts/';
  var presentationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/presentations/';

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

    allResultsConcat.map(function (item) {
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

        // console.log(finalResult);

        render(finalResult);
      });
    });
  });
});
