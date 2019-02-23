// import { Z_ASCII } from "zlib";

;(function() {
  /* from https://davidwalsh.name/javascript-debounce-function */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }

  var parentSelector = '#graphic';
  var chartHeight = 200;

  var width = parseInt(d3.select(parentSelector).style('width'));
  var height = chartHeight / 1.8;

  // Clipping path data
  var clippingData = [
    { x: 10, y: 10 },
    { x: 200, y: 10 },
    { x: 170, y: 220 },
    { x: 35, y: 220 }
  ];

  // Clipping path stroke outline data
  var clippingDataOutline = [
    { x: 197, y: 50 },
    { x: 175, y: 205 },
    { x: 31, y: 205 },
    { x: 13, y: 50 },
    { x: 200.35, y: 50 }
  ];

  var svg = d3.select('#tax-graphic');

  var aspect = width / height;

  d3.select(window).on('resize', function() {
    var targetWidth = svg.node().getBoundingClientRect().width;
    svg.attr('width', targetWidth);
    svg.attr('height', targetWidth / aspect);
  });

  // var margin = { top: 20, right: 180, bottom: 30, left: 40 }

  var bucketOutline = d3.line()
    .x(function(d, i) {
      return d.x * 2;
    })
    .y(function(d, i) {
      return d.y * 2;
    });
  // .curve(interpolate)

  var bucketClip = svg.append('clipPath').attr('id', 'clip');

  bucketClip.selectAll('path')
    .data([clippingData])
    .enter()
    .append('path')
    .attr('class', 'bucket-clip__class')
    .attr('id', 'bucket-clip_id')
    .attr('d', bucketOutline)
    .style('transform', 'translate(0,50px)');

  var groupClipping = svg.append('g')
    .attr('clip-path', 'url(#clip')
    .style('transform', 'translate(30px,-50px)');

  var g = groupClipping.append('g');

  var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.3)
    .align(0.3);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
    .range(['#51767c', '#72c1dd']);

  var stack = d3.stack();

  d3.csv('data/data.csv', function(error, data) {
    if (error) throw error

    data.forEach(function(d) {
      d.Slider = d.Slider
      d.perc1 = +d.perc1
      d.perc2 = +d.perc2
      console.log(d.name)
    });

    var data_nest = d3.nest()
      .key(function(d) {
        return d.Slider
      })
      .entries(data);

    var data_nest_percent = d3.nest()
      .key(function(d) {
        return d.Slider
      })
      .entries(data);

    data = data_nest.filter(function(d) {
      return d.key == 0;
    })[0].values;

    dataPercent = data_nest_percent.filter(function(d) {
      return d.key == 0;
    })[0].values;

    var category = ['one', 'two'];

    x.domain(
      data.map(function(d) {
        return d.x;
      })
    )
    y.domain([0, 17000000000]).nice()
    z.domain(category);

    g.selectAll('.bars')
      .data(stack.keys(category)(data))
      .enter()
      .append('g')
      .attr('class', 'bars')
      .attr('fill', function(d) {
        return z(d.key);
      })
      .selectAll('rect')
      .data(function(d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', function(d) {
        return x(d.data.x) - 100;
      })
      .attr('y', function(d) {
        return y(d[1]) + 300;
      })
      .attr('height', function(d) {
        return y(d[0]) - y(d[1]);
      })
      .attr('width', x.bandwidth() + 80);

    /*** Percentage values needed ***/

    // var data_nest_legend = d3
    // .nest()
    // .key(function(d) {
    //   return d.Slider
    // })
    // .entries(data)
    // .map(function(d) {
    //   Slider: d.key,
    //   perc1: d.values,
    //   perc2: d.values
    // })

    // g.selectAll('.text')
    // .data(data)
    // .enter()
    // .append('text')
    // .attr("text-anchor", "middle")
    // .text(function(d, i) {
    //   return d.perc1
    // });

    var bucketStroke = g.append('g');
    // .style('transform', 'translate(0px, 0px')

    bucketStroke.selectAll('path')
      .data([clippingDataOutline])
      .enter()
      .append('path')
      .attr('class', 'bucket-outline__class')
      .attr('id', 'bucket-outline_id')
      .attr('d', bucketOutline)
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', '#254951');

    var legend = g.selectAll('.legend')
      .data(stack.keys(category)(data))
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('x', 100)
      .style('font', '10px sans-serif');

    legend.append('rect')
      .attr('x', function(d, i) {
        return width / 8 + i * 80
      })
      .attr('y', 450)
      .attr('width', 23)
      .attr('height', 18)
      .attr('fill', function(d) {
        return z(d.key)
      });

    // legend.append('text')
    // // .data(data)
    // .data(stack.keys(perc)(data))
    // .attr('x', function(d, i) {
    //   return (width / 8) + i * 80
    // })
    //   .attr('y', 450)
    //   .attr('dy', 15)
    //   .attr('text-anchor', 'start')
    //   .attr('class', 'legend-text')
    //   .style('transform', 'translateX(30px)')
    //   .text(function(d,i) { return d })

    // Slider
    d3.select('#sliderInput')
      .on('change', changed);

    // Changes on sliding
    function changed() {
      // console.log(this.value)

      var value = this.value;

      var speedClass_lookup = {
        0: 'speed-none',
        25: 'speed-00',
        50: 'speed-01',
        75: 'speed-02',
        100: 'speed-03'
      };

      var speed_class = speedClass_lookup[this.value];

      animateTears();

      function animateTears() {
        // Tears animation
        var speeds = [
          'speed-00',
          'speed-01',
          'speed-02',
          'speed-none',
          'speed-03'
        ];

        var tearsClass = document.querySelectorAll('.rich-person_face-tears');

        tearsClass.forEach(function(tears, i) {
          tears.classList.remove(...speeds);
          setTimeout(() => {
            tears.classList.add(speed_class);
          }, i * 100)
        });

        // Faces animation
        var facesClass = document.querySelectorAll('.rich-person_face-happy');
        facesClass.forEach(function(faces) {
          if (value == 0) {
            faces.classList.replace(
              'rich-person_face-very-sad',
              'rich-person_face-happy'
            );
          } else {
            faces.classList.add('rich-person_face-very-sad');
          }
        })

        var yuppyClass = document.querySelectorAll('.rich-person_yuppy-happy');
        yuppyClass.forEach(function(faces) {
          if (value == 0) {
            faces.classList.replace(
              'rich-person_yuppy-very-sad',
              'rich-person_yuppy-happy'
            );
          } else {
            faces.classList.add('rich-person_yuppy-very-sad');
          }
        });

        var yuppyClass = document.querySelectorAll(
          '.rich-person_oldwoman-happy'
        );

        yuppyClass.forEach(function(faces) {
          if (value == 0) {
            faces.classList.replace(
              'rich-person_oldwoman-very-sad',
              'rich-person_oldwoman-happy'
            );
          } else {
            faces.classList.add('rich-person_oldwoman-very-sad');
          }
        });
      }

      // Transitions of stacked bar chart
      g.selectAll('.bars')
        .data(
          stack.keys(category)(
            data_nest.filter(function(d) {
              return +d.key == value;
            })[0].values
          )
        )
        .selectAll('rect')
        .data(function(d) {
          return d;
        })
        .transition()
        .duration(300)
        .delay(function(d, i) {
          return i * 50;
        })
        .attr('height', function(d) {
          return y(d[0]) - y(d[1]);
        })
        .attr('x', function(d) {
          return x(d.data.x) - 150;
        })
        .attr('y', function(d) {
          return y(d[1]) + 300;
        })

      g.selectAll('.text')
        .data(data)
        .enter()
        .append('text')
        .transition()
        .duration(300)
        .attr('text-anchor', 'middle')
        .text(function(d, i) {
          return d.amount;
        });
    }
  });

  // var tearsSVG = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32.5 67.7" style="enable-background:new 0 0 32.5 67.7;" xml:space="preserve"><style type="text/css">.st0{fill:#72C1DD;stroke:#254951;stroke-width:3;stroke-miterlimit:10;}</style><path class="st0" d="M1.8,48.4c-0.3,2.2-0.3,2.4-0.3,3.1c0,8.1,6.6,14.8,14.8,14.8S31,59.6,31,51.5c0-1-0.1-1.8-0.3-3.1 C28.6,37.3,16.3,10.6,16.3,0C16.3,10.7,3.1,39.9,1.8,48.4z"/></svg>'

  //  Faces & tears
  var richPerson = d3.select('#rich-people')
    .append('div')
    .attr('class', 'rich-person')
    .html(
      '<div>' +
        '<ul class="rich-person_ul">' +
          '<li class="rich-person_li">' +
            '<div class="rich-person_face rich-person_yuppy"><img src="assets/yuppy-face-head-face.svg"></div>' +
            '<div class="rich-person_emotions rich-person_yuppy-happy"></div>' +
            '<div class="rich-person_face-tears">' +
            // tearsSVG +
            '</div>' +
          '</li>' +
        '<li class="rich-person_li">' +
        '<div class="rich-person_face rich-person_monopoly"><img src="assets/monopoly-face-head.svg"></div>' +
        '<div class="rich-person_emotions rich-person_face-happy"></div>' +
        '<div class="rich-person_face-tears">' +
        // tearsSVG +
        '</div>' +
        '</li>' +
        '<li class="rich-person_li">' +
        '<div class="rich-person_face rich-person_oldwoman"><img src="assets/old-woman-face.svg"></div>' +
        '<div class="rich-person_emotions rich-person_oldwoman-happy"></div>' +
        '<div class="rich-person_face-tears">' +
        // tearsSVG +
        '</div>' +
        '</li>' +
        '</ul>' +
        '</div>'
    );

  // document.addEventListener('DOMContentLoaded', function() {
  //   var pymChild = pym.Child({ polling: 500 });

  //   pymChild.sendHeight();
  //   window.addEventListener(
  //     'resize',
  //     debounce(function() {
  //       pymChild.sendHeight();
  //     }, 250)
  //   );
  // })
})()
