var GRADEBOOK_BODY_CSS_PATH           = '#container_content > div.content_margin > table:nth-child(6)';

var ASSIGNMENT_TABLE_HEADER_CSS_PATH  = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)';
var ASSIGNMENT_TABLE_SCORE_CSS_PATH   = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)';
var ASSIGNMENT_TABLE_CSS_PATH         = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody';


var CLASS_LETTER_GRADE_CSS_PATH       = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(4)';
var CLASS_NUMBER_GRADE_CSS_PATH       = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(2)';

var CATEGORIES_CSS_PATH               = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div:nth-child(3) > div.module_content > table > tbody > tr:nth-child(n+2)';
var WEIGHTED_OR_UNWEIGHTED_CSS_PATH   = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div:nth-child(3) > div.module_content > table > tbody > tr:nth-child(1) > td:nth-child(2)';

var NEW_ASSIGNMENT_HTML = chrome.extension.getURL('new_assignment.html');
var limited_control = true;
var is_weighted;      //change to weighted_status
var categories = {};
var category_name_list = [];

function getIsWeighted(){
  return $(WEIGHTED_OR_UNWEIGHTED_CSS_PATH).text() === 'Weight:';
}

function createAssignmentAddButton(append_location){
  var assignment_add_button = $('<input/>', { type: 'button',
                                              id: 'add_assignment_button',
                                              value: 'Add New Assignment'
                                            });
  $(append_location).append(assignment_add_button);
}

function getCategoryInfo(category_element){
  var category = {};
  category['name'] = $(category_element).find('td.list_label_grey').text();
  var weight = $(category_element).find('td:nth-child(2)').text();
  weight = weight.substring(0, weight.length-1);
  weight = parseFloat(weight)/100;
  category['weight'] = weight;
  category['score'] = $(category_element).find('td:nth-child(3)').text();
  categories[category['name']] = category;
  category_name_list.push(category['name']);
}

function generateSelectionListCategories(category_list){
  var selection_list_categories = [];
  $.each(category_list, function(idx, obj){
    selection_list_categories.push('<option value="'+ obj["name"] +'">'+ obj["name"] +'</option>');
  });
  return selection_list_categories;
}

function createNewAssignment(append_location, selection_list_categories){
    $(append_location).append($('<tr>').load(NEW_ASSIGNMENT_HTML, function(){
    $(append_location).find('.date').text("NEW");
    $(append_location).find('.delete_assignment').last().on('click', function(event){
      $(this).closest('tr').remove();
    });
    $(append_location).find('select[name="category_name"]').html(selection_list_categories.join(''));
  }));
}

function createEditableOriginalAssignment(assignment_element){
  var score=0;
  var max_score=0;
  var t = findScores($(assignment_element).text());
  score=t[0];
  max_score=t[1];

  $(assignment_element).append('\
    <form>\
    <input type="number" name="score" style="width: 40px;" min="0"> /\
     <input type="number" name="max_score" style="width: 40px;" min="0"> \
    <div class="assignment_percent" style="display:inline !important;"></div></form>');
  if(limited_control && (score!=0 || max_score!=0)){
    $(assignment_element).find('input[name="max_score"]').prop('readonly', true);
    if($(assignment_element).closest('tr').hasClass('highlight')){
      $(assignment_element).find('input[name="max_score"]').css('background-color', '#faf6da');

    }
  }
  var percent = $(assignment_element).find('form > div.assignment_percent');

  $(assignment_element).find('input[name="score"]').val(parseInt(score));
  $(assignment_element).find('input[name="score"]').text(score);

  $(assignment_element).find('input[name="max_score"]').val(parseInt(max_score));
  $(assignment_element).find('input[name="max_score"]').text(max_score);
}



function calculateStuff(){      //Love you Andrew Carpenter. Shoutout to DBC Open Theme Hackathon
  return 8*19;
}

function getAssignmentInfo(assignment_element){
  var assignment_score_cell = $(assignment_element).find('td:nth-child(4)');

  var user_score = $(assignment_score_cell).find('form > input[type="number"]:nth-child(1)').val();
  var max_score = $(assignment_score_cell).find('form > input[type="number"]:nth-child(2)').val();
  var percent = $(assignment_score_cell).find('form > div.assignment_percent');

  var category = $(assignment_element).find('td:nth-child(1) > div > form > select').val();
  if(typeof category === 'undefined'){
    var temp_text = $(assignment_element).find('td:nth-child(1) > div').contents().get(0);
    if(typeof temp_text !== 'undefined'){
      category = temp_text.nodeValue.trim();
    } else {
      category = category_name_list[0];
    }
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
  return {'category': category, 'user_score': user_score, 'max_score': max_score};
}

function generateNumberGrade(user_points, max_points){
  var total_grade             = 0;
  var grade_weighted          = 0;
  var total_weight            = 0;
  var user_points_unweighted  = 0;
  var max_points_unweighted   = 0;
  $.each(user_points, function(idx, obj){
    if(is_weighted){
      grade_weighted += categories[idx]["weight"] * (obj/max_points[idx]);
      total_weight += categories[idx]["weight"];
    } else {
      user_points_unweighted += obj;
      max_points_unweighted += max_points[idx];
    }
  });
  if(is_weighted){
    total_grade = (1.0/total_weight) * grade_weighted * 100;
  } else{
    total_grade = (user_points_unweighted / max_points_unweighted)*100;
  }
  return total_grade;
}

function generateLetterGrade(number_grade){
  var grade_scale=['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
  var letter_grade = (number_grade-60)/3.33333333333333333333333;
  letter_grade = Math.min(letter_grade, grade_scale.length-1);
  letter_grade = Math.max(letter_grade, 0);
  letter_grade = Math.ceil(letter_grade);
  return grade_scale[letter_grade];
}


function initPointObjectCategories(){
  var points = {};
   $.each(categories, function(idx, obj){
    points[obj["name"]] = 0;
  });
   return points;
}

function updateGrade(){
  var user_points = initPointObjectCategories();
  var max_points  = initPointObjectCategories();


  $(ASSIGNMENT_TABLE_CSS_PATH +' > tr').each(function(){
    var assignment = getAssignmentInfo($(this));
    user_points[assignment['category']] += assignment['user_score'];
    max_points[assignment['category']]  += assignment['max_score'];
  });

  var number_grade  = generateNumberGrade(user_points, max_points);
  var letter_grade  = generateLetterGrade(number_grade);

  $(CLASS_LETTER_GRADE_CSS_PATH).text((number_grade).toFixed(2) + "%");
  $(CLASS_NUMBER_GRADE_CSS_PATH).text(letter_grade);

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

function todayDate() {
    var today_date = new Date();
    var myyear = today_date.getFullYear();
    var mymonth = today_date.getMonth() + 1;
    var mytoday = today_date.getDate();
    return +mymonth+"/"+mytoday+"/"+myyear.toString().substr(2, 4);
}

//////////////////////////////////////////////////////////////////
///////         Document On Ready      ///////////////////////////
//////////////////////////////////////////////////////////////////
$(document).on('ready',function(){
  is_weighted = getIsWeighted();
  createAssignmentAddButton(ASSIGNMENT_TABLE_CSS_PATH);


  $(CATEGORIES_CSS_PATH).each(function(){
    getCategoryInfo($(this));
  });

  var selection_list_categories = generateSelectionListCategories(categories);

  $('#add_assignment_button').on('click', function(event){
    createNewAssignment(ASSIGNMENT_TABLE_CSS_PATH, selection_list_categories);
    $('#add_assignment_button').appendTo(ASSIGNMENT_TABLE_CSS_PATH);
  });

  $(ASSIGNMENT_TABLE_SCORE_CSS_PATH).each(function(){
    createEditableOriginalAssignment($(this));
  });

  startUpdateGrade()
});
