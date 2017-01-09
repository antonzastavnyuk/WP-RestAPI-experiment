$('document').ready(function () {
  var $container;
  $('.wrapper').append('<ul />').addClass('social-media__list');
  $container = $('ul');

  function getData(url) {
    return new Promise(function (resolve) {
      jQuery.ajax({
        url: url,
        type: 'get',
        dataType: 'JSON',
        success: function (data) {
          resolve(data);
        }
        // TODO: add method if error
      });
    });
  }

  function sortByDate(i, ii) {
    if (i[0] > ii[0]) { return 1; } else if (i[0] < ii[0]) { return -1; } else { return 0; }
  }

  function render(arr) {
    arr.forEach(function (value) {
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
      $divDescription.append($divImageContainer).append($divTitleContainer);
      // var img = $('<img />', { src: data.source_url, style: 'height: 100%;' });
      // $divImageContainer.append(img);
      $divTitleContainer.append('<p>' + title + '</p>').append($autorsMeta);
      $divMeta.append($linkItem).append($itemDate);
    });
  }

  var publicationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/publications/';
  var postsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/posts/';
  var presentationsUrl = 'http://macmillan.zindex.host/wp-json/wp/v2/presentations/';

  getData(publicationsUrl)
    .then(function (result) {
      getData(presentationsUrl).then(function (data) {
        var array = [];
        data.forEach(function (item) {
          result[result.length] = item;
        });

        result.forEach(function (value) {
          var author;
          if (value.type === 'publications') {
            author = value.acf.pb_authors_meta;
            pdf = value.acf.pb_pdf_file;
          } else if (value.type === 'presentations') {
            console.log(value.acf);
            author = value.acf.pt_author[0].post_title;
            pdf = value.acf.pt_pdf_file;
          }
          // TODO: Add condition if publications or presentations
          array[array.length] = [
            value.date,
            value.title.rendered,
            author,
            pdf,
            value.type];
        });

        array.sort(sortByDate); // TODO: sort dont work
        render(array);
      });
    });
    // .then(function (data) {
    //   getData(postsUrl)
    //     .then(function (result) {
    //       result.map(function (value) {
    //         console.log(value);
    //         var imageHref = value._links['wp:featuredmedia'][0].href;
    //         var item = getData(imageHref).then(function (imageUrl) {
    //           return [value.title.rendered,
    //             imageUrl.source_url,
    //             value.acf.pb_authors_meta,
    //             value.acf.pb_pdf_file,
    //             value.date,
    //             'post'];
    //         });
    //         data[data.length] = item;
    //       });
    //     });
    //   return data;
    // })
    // .then(function (data) {
    //   // console.log(JSON.stringify(data));
    // });
});
