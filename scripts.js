var elems = document.getElementsByClassName("icon");
var increase = Math.PI * 2 / elems.length;
var x = 0; var y = 0;
var angle = 0; var radius = 200; var width = 25; var height = 25;
var center_top = ($("#slider-1").height() - $("#icon-1").height()) / 2;
var center_left = ($("#slider-1").width() - $("#icon-1").width()) / 2;
var count_Click; var curr_time; var nextTimeStamp; var mt; var dist_Click; var choice_width; var choice_dist;
var experimentData = []; var fileCSV = [["W", "D", "Actual Distance", "MT"]];


function start() {
  choice_width = $('input[name=width]:checked').val();
  choice_dist = $('input[name=distance]:checked').val();

  if (!choice_width || !choice_dist) {
    if (choice_dist) {
      alert('please select width');
    } else if (choice_width) {
      alert('please select distance');
    } else {
      alert('please select both width & distance');
    }
  }

  console.log('choice_dist & choice_dist:', choice_width, choice_dist);

  $('.icon').css({
    'top': center_top + 'px',
    'left': center_left + 'px'
  });

  $(elems).css('opacity', '0').each(function (i) {
    elem = elems[i];

    x = choice_dist * Math.cos(angle) + center_left; //choice_dist = radius
    y = choice_dist * Math.sin(angle) + center_top; //choice_dist = radius

    $(elem).css("background-color", "rgb(10,30,90)");
    $(elem).off("click");

    $(elem).animate({
      'position': 'absolute',
      'width': choice_width + 'px', //choice_width = width
      'height': choice_width + 'px', // choice_width == height
      'left': x + 'px',
      'top': y + 'px',
      'opacity': '1'
    });

    angle += increase;
  });

  $('.start_note').css('visibility', 'hidden');
  $('.experiment_note').css('visibility', 'visible');
  count_Click = 0;
  mt = [];
  dist_Click = [];
  beginExp();
  
}

function beginExp(prev_circle) {
  curr_time = Date.now();

  //console.log(count_Click);
  if (count_Click === 16) {
    index_diff(mt, dist_Click, choice_width, choice_dist);
    alert('The trial has ended. Choose different widths and distances and continue trials');
    $('.experiment_note').css('visibility', 'hidden');
    $('.start_note').css('visibility', 'visible');
  } else {
    var filteredElems = _.without(elems, prev_circle);
    var x = Math.floor(Math.random() * filteredElems.length);
    var rand_ele = filteredElems[x];

    if (prev_circle) {
      dist_Click.push(dist_circle(prev_circle, rand_ele));
    }

    $(rand_ele).css("background-color", "rgb(10, 136, 66)");
    $(rand_ele).click(function () {
      count_Click++;
      $(rand_ele).off("click");
      $(rand_ele).css("background-color", "rgb(10,30,90)");
      nextTimeStamp = Date.now();
      mt.push(nextTimeStamp - curr_time);
      beginExp(rand_ele);
    });
  }
}

$("#btnExport").click(function (e) {
  e.preventDefault();
  file = toCSV(choice_width, choice_dist, dist_Click, mt);
  convert_CSV(file);
  console.log(file);
  var data_type = 'data:application/vnd.ms-excel';
  var table_div = document.getElementById('experimentTable');
  var table_html = table_div.outerHTML.replace(/ /g, '%20');
  var a = document.createElement('a');
  a.href = data_type + ', ' + table_html;
  a.download = 'experiment_data' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';
  a.click();
});

function index_diff(time, clickDistances, width, distance) {
  var i_o_d;
  var i_o_p;
  var distSum = 0;
  var avg_dist = find_avg(clickDistances);
  var avg_mt = find_avg(mt) / 1000;

  i_o_d = Math.log2((parseInt(avg_dist) / (width)) + 1);
  i_o_p = i_o_d / avg_mt;
  experimentData.push({field1: avg_mt,field2: avg_dist, field3: i_o_d, field4: i_o_p});
  loadTable('experimentTable', ['field1', 'field2','field3', 'field4'], experimentData);
  $('#experimentTable tr:last').remove();

}

function convert_CSV(twoDiArray) {
    var csvRows = [];
    for (var i = 0; i < twoDiArray.length; ++i) {
        for (var j = 0; j < twoDiArray[i].length; ++j) {
            twoDiArray[i][j] = '\"' + twoDiArray[i][j] + '\"';  // Handle elements that contain commas
        }
        csvRows.push(twoDiArray[i].join(','));
    }

    var csvString = csvRows.join('\r\n');
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' + csvString;
    a.target      = '_blank';
    a.download    = 'myFile.csv';

    document.body.appendChild(a);
    a.click();
}

function find_avg(values) {
  var valuesSum = 0;
  for (var i = 0; i < values.length; i++) {
    valuesSum += parseInt(values[i], 10);
  }

  return valuesSum / values.length;
}

function dist_circle(past, current) {
  var element1 = past.getBoundingClientRect();
  var element2 = current.getBoundingClientRect();
  var dx = (element1.left + (element1.right - element1.left) / 2) - (element2.left + (element2.right - element2.left) / 2);
  var dy = (element1.top + (element1.bottom - element1.top) / 2) - (element2.top + (element2.bottom - element2.top) / 2);
  var dist = Math.sqrt(dx * dx + dy * dy);

  return dist;
}

function toCSV(width, distance, act_dist, mt) {
  for (var i = 0; i < mt.length - 1; i++) {
    rowCSV = [];
    width = parseInt(width, 10); distance = parseInt(distance, 10);
    actDistance = parseFloat(parseFloat(act_dist[i], 10).toFixed(4)); movTime = parseInt(mt[i], 10);

    rowCSV.push(width); rowCSV.push(distance); rowCSV.push(actDistance); rowCSV.push(movTime); fileCSV.push(rowCSV)
  }
 return fileCSV;
}


function loadTable(tableId, fields, data) {
 // $('#' + tableId).empty(); //not really necessary
  var rows = '';
  $.each(data, function (index, item) {
    var row = '<tr>';
    $.each(fields, function (index, field) {
      row += '<td>' + item[field + ''] + '</td>';
    });
    rows += row + '<tr>';
  });
  $('#' + tableId + ' tbody').html(rows);
}