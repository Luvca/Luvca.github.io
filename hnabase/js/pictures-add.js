$(function () {
  'use strict';

  $(document).ready(function () {
    firebase.initializeApp({
      projectId: 'hnabase'
    });
    var tags = [];
    var db = firebase.firestore();
    db.collection("tags").get().then(function (docs) {
      docs.forEach(function (doc) {
        console.log(doc.id);
        tags.push(doc.id);
      });
    }).then(function () {
      console.log(tags);
      var citynames = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: tags
      });
      citynames.initialize();
    });

    var cities = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: 'data/cities.json'
    });
    cities.initialize();

    /**
     * Typeahead
     */
    var elt = $('.example_typeahead > > input');
    elt.tagsinput({
      typeaheadjs: {
        name: 'citynames',
        displayKey: 'name',
        valueKey: 'name',
        source: citynames.ttAdapter()
      }
    });

    /**
     * Objects as tags
     */
    elt = $('.example_objects_as_tags > > input');
    elt.tagsinput({
      itemValue: 'value',
      itemText: 'text',
      typeaheadjs: {
        name: 'cities',
        displayKey: 'text',
        source: cities.ttAdapter()
      }
    });

    elt.tagsinput('add', { "value": 1 , "text": "Amsterdam"   , "continent": "Europe"    });
    elt.tagsinput('add', { "value": 4 , "text": "Washington"  , "continent": "America"   });
    elt.tagsinput('add', { "value": 7 , "text": "Sydney"      , "continent": "Australia" });
    elt.tagsinput('add', { "value": 10, "text": "Beijing"     , "continent": "Asia"      });
    elt.tagsinput('add', { "value": 13, "text": "Cairo"       , "continent": "Africa"    });

    /**
     * Categorizing tags
     */
    elt = $('.example_tagclass > > input');
    elt.tagsinput({
      tagClass: function(item) {
        switch (item.continent) {
          case 'Europe'   : return 'label label-primary';
          case 'America'  : return 'label label-danger label-important';
          case 'Australia': return 'label label-success';
          case 'Africa'   : return 'label label-default';
          case 'Asia'     : return 'label label-warning';
        }
      },
      itemValue: 'value',
      itemText: 'text',
      // typeaheadjs: {
      //   name: 'cities',
      //   displayKey: 'text',
      //   source: cities.ttAdapter()
      // }
      typeaheadjs: [{
        hint: true,
        highlight: true,
        minLength: 2
      }, {
        name: 'cities',
        displayKey: 'text',
        source: cities.ttAdapter()
      }]
    });
    elt.tagsinput('add', { "value": 1 , "text": "Amsterdam"   , "continent": "Europe"    });
    elt.tagsinput('add', { "value": 4 , "text": "Washington"  , "continent": "America"   });
    elt.tagsinput('add', { "value": 7 , "text": "Sydney"      , "continent": "Australia" });
    elt.tagsinput('add', { "value": 10, "text": "Beijing"     , "continent": "Asia"      });
    elt.tagsinput('add', { "value": 13, "text": "Cairo"       , "continent": "Africa"    });

    // HACK: overrule hardcoded display inline-block of typeahead.js
    $(".twitter-typeahead").css('display', 'inline');
  });

  $('input, select').on('change', function(event) {
    var $element = $(event.target),
      $container = $element.closest('.example');

    if (!$element.data('tagsinput'))
      return;

    var val = $element.val();
    if (val === null)
      val = "null";
    $('code', $('pre.val', $container)).html( ($.isArray(val) ? JSON.stringify(val) : "\"" + val.replace('"', '\\"') + "\"") );
    $('code', $('pre.items', $container)).html(JSON.stringify($element.tagsinput('items')));
  }).trigger('change');

  $('#form').validator().on('submit', function (e) {
    if (e.isDefaultPrevented()) {
    } else {
        alert('all OK !');
    }
  });
});
