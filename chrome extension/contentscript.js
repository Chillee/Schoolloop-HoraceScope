var GRADEBOOK_BODY_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6)';

var ASSIGNMENT_TABLE_HEADER_CSS_PATH  = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)';
var ASSIGNMENT_TABLE_SCORE_CSS_PATH   = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)';
var ASSIGNMENT_TABLE_CSS_PATH       = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody';


var CLASS_LETTER_GRADE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(4)';
var CLASS_NUMBER_GRADE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(2)';

var CATEGORIES_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div:nth-child(3) > div.module_content > table > tbody > tr:nth-child(n+2)';
var WEIGHTED_OR_UNWEIGHTED_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div:nth-child(3) > div.module_content > table > tbody > tr:nth-child(1) > td:nth-child(2)';

var limited_control = true;
var is_weighted;
var categories = {};

function getIsWeighted(){
  return $(WEIGHTED_OR_UNWEIGHTED_CSS_PATH).text() === 'Weight:';
}
function addAssignmentButton(append_location){
  var assignment_add_button = $('<input/>', { type: "button", id: "add_assignment_button", value: "Add New Assignment" });
  $(append_location).append(assignment_add_button);
}

$(document).on('ready',function(){
  is_weighted = getIsWeighted();
  addAssignmentButton(ASSIGNMENT_TABLE_CSS_PATH);


  $(CATEGORIES_CSS_PATH).each(function(){
    var category = {};
    category["name"] = $(this).find('td.list_label_grey').text();
    var weight = $(this).find('td:nth-child(2)').text();
    weight = weight.substring(0, weight.length-1);
    weight = parseFloat(weight)/100;
    category["weight"] = weight;
    category["score"] = $(this).find('td:nth-child(3)').text();
    categories[category["name"]] = category;
  });
  var output = [];
  $.each(categories, function(idx, obj){
    output.push('<option value="'+ obj["name"] +'">'+ obj["name"] +'</option>');
  });



  $('#add_assignment_button').on('click', function(event){     //Adds a new assignment to the end of the assignments, loading html from new_assignment.html
    event.preventDefault();

    $(ASSIGNMENT_TABLE_CSS_PATH).append($('<tr>').load(chrome.extension.getURL("new_assignment.html"), function(){
      $(ASSIGNMENT_TABLE_CSS_PATH).find('.date').text("NEW");
      $(ASSIGNMENT_TABLE_CSS_PATH).find('.delete_assignment').last().on('click', function(event){
        console.log($(this).closest('tr'));
        $(this).closest('tr').remove();
    });
      $(ASSIGNMENT_TABLE_CSS_PATH).find('select[name="category_name"]').html(output.join(''));
    }));

    $('#add_assignment_button').appendTo(ASSIGNMENT_TABLE_CSS_PATH);
  });



  $(ASSIGNMENT_TABLE_SCORE_CSS_PATH).each(function(){     //Adds editable forms to original assignments, filling them in with their current grades
    //$(this).attr('contentEditable', 'true');
    var score=0;
    var max_score=0;
    var t = findScores($(this).text());
    score=t[0];
    max_score=t[1];

    $(this).append('<form>\
      <input type="number" name="score" style="width: 40px;" min="0"> / <input type="number" name="max_score" style="width: 40px;" min="0"> \
      <div class="assignment_percent" style="display:inline !important;"></div></form>');
    if(limited_control && (score!=0 || max_score!=0)){
      $(this).find('input[name="max_score"]').prop('readonly', true);
      if($(this).closest('tr').hasClass('highlight')){
        $(this).find('input[name="max_score"]').css('background-color', '#faf6da');

      }
    }
    var percent = $(this).find('form > div.assignment_percent');

    $(this).find('input[name="score"]').val(parseInt(score));
    $(this).find('input[name="score"]').text(score);

    $(this).find('input[name="max_score"]').val(parseInt(max_score));
    $(this).find('input[name="max_score"]').text(max_score);
    updateGrade();
    //console.log($(this).text());
  });
  startUpdateGrade()

})


function calculateStuff(){      //Love you Andrew Carpenter
  return 8*19;
}

function updateGrade(){
  var cur_points = {};
  var max_points = {};
  var grade_weighted = 0;
  var grade_unweighted = 0;
  var cur_points_unweighted = 0;
  var max_points_unweighted = 0;
  var total_weight = 0;
  console.log(categories);
  $.each(categories, function(idx, obj){
    console.log(obj);
    cur_points[obj["name"]] = 0;
    max_points[obj["name"]] = 0;
  })

  $(ASSIGNMENT_TABLE_CSS_PATH +' > tr').each(function(){
    var assignment_table_score = $(this).find('td:nth-child(4)');
    var user_score = $(assignment_table_score).find('form > input[type="number"]:nth-child(1)').val();
    var max_score = $(assignment_table_score).find('form > input[type="number"]:nth-child(2)').val();
    var percent = $(assignment_table_score).find('form > div.assignment_percent');
    var category = $(this).find('td:nth-child(1) > div > form > select').val();
    var total_weight = 0;
    if(typeof category == 'undefined'){
      category = $(this).find('td:nth-child(1) > div').contents().get(0).nodeValue.trim();
    }



    percent.text(((user_score/max_score) * 100).toFixed(2) + "%");
    user_score = parseFloat(user_score);
    max_score = parseFloat(max_score);
    if(isNaN(user_score)){
      user_score = 0;
    }
    if(isNaN(max_score)){
      max_score = 0;
    }
    console.log(user_score);
    cur_points[category] += user_score;
    max_points[category] += max_score;
  });


  $(CATEGORIES_CSS_PATH).each(function(){
    $.each(categories, function(idx, obj){
      console.log(obj["name"]);
      console.log($(this).find('td.list_label_grey').text());
      /*if(obj["name"] = $(this).find('td.list_label_grey').text()){
        console.log($(this));
      }*/
    });
  });

  console.log(cur_points);
  console.log(max_points);




  $.each(cur_points, function(idx, obj){
    console.log(obj);
    console.log(idx);
    console.log(categories[idx]);
    cur_points_unweighted += obj;
    max_points_unweighted += max_points[idx];
    grade_weighted += categories[idx]["weight"] * (obj/max_points[idx]);
    total_weight += categories[idx]["weight"];
  });
  grade_unweighted = (cur_points_unweighted/max_points_unweighted) * 100;
  grade_weighted = (1.0/total_weight) * grade_weighted*100;
  var final_grade;

  if(is_weighted){
    final_grade = grade_weighted;
  } else{
    final_grade = grade_unweighted;
  }
  var grade_scale=['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
  //var grade = (cur_points_unweighted/max_points_unweighted) * 100;
  var letter_grade = (final_grade-60)/3.33333333333333333333333;
  letter_grade = Math.min(letter_grade, grade_scale.length-1);
  letter_grade = Math.max(letter_grade, 0);
  letter_grade = Math.ceil(letter_grade);

  console.log(max_points);
  $(CLASS_LETTER_GRADE_CSS_PATH).text((final_grade).toFixed(2) + "%");
  $(CLASS_NUMBER_GRADE_CSS_PATH).text(grade_scale[letter_grade]);

}

function startUpdateGrade(){
  //setInterval('updateGrade()', interval);
  $(document).click(function(e) {
    updateGrade();
  });
  $(document).keyup(function(e) {
    e.preventDefault();
      updateGrade();
  });
}

function findScores(text){
  if(text == null){
    return [0, 0];
  }
  var scores = text;
  if(scores.indexOf("Excused") != -1){
    return [0, 0];
  }
  var grade1 = scores.match(/([0-9]|[" "]|[.])+((\/))/g);
  if(grade1 == null){
    return [0, 0];
  }
  grade1 = grade1[0];
  var grade= grade1.substring(0, grade1.length-2);
  //console.log(grade);

  var grade2 = scores.match(/((\/))+([0-9]|[" "]|[.])*/g);
  grade2 = grade2[0];
  var outOf= grade2.substring(2, grade2.length-1);
  return [grade, outOf];
}
function todaydate() {
    var today_date = new Date()
    var myyear = today_date.getFullYear()
    var mymonth = today_date.getMonth() + 1
    var mytoday = today_date.getDate()
    return +mymonth+"/"+mytoday+"/"+myyear.toString().substr(2, 4);
}
