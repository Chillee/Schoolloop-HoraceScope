var GRADEBOOK_BODY_CSS_PATH           = '#container_content > div.content_margin > table:nth-child(6)';

var ASSIGNMENT_TABLE_WRAPPER_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody';
var ASSIGNMENT_TABLE_HEADER_CSS_PATH  = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)';
var ASSIGNMENT_TABLE_SCORE_CSS_PATH   = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)';
var ASSIGNMENT_TABLE_CSS_PATH         = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody';


var CLASS_NUMBER_GRADE_CSS_PATH       = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(4)';
var CLASS_LETTER_GRADE_CSS_PATH       = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(2)';

var CATEGORIES_CSS_PATH               = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div.module:eq(1) > div.module_content > table > tbody > tr:nth-child(n+2)';
var WEIGHTED_OR_UNWEIGHTED_CSS_PATH   = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_right > div.module:eq(1) > div.module_content > table > tbody > tr:nth-child(1) > td:nth-child(2)';

var NEW_ASSIGNMENT_HTML = chrome.extension.getURL('new_assignment.html');
var OPTIONS_HTML = chrome.extension.getURL('options.html');
var FINALS_HTML = chrome.extension.getURL('finals_assignment.html');

var VERSION = "0.1";
var limited_control = true;
var original_grade;
var is_weighted;      //change to weighted_status
var categories = {};
var category_name_list = [];
var finals_category;


//////////////////////////////////////////////////////////////////
///////         Document On Ready      ///////////////////////////
//////////////////////////////////////////////////////////////////
$(document).on('ready',function(){
  console.log("version is: " + VERSION);
  is_weighted = getIsWeighted();
  // createFinalsToggleButton(ASSIGNMENT_TABLE_WRAPPER_CSS_PATH);
  // createAssignmentAddButton(ASSIGNMENT_TABLE_CSS_PATH);
  $(ASSIGNMENT_TABLE_CSS_PATH).prepend($('<tr id="menu_assignment">').load(OPTIONS_HTML, function(){
    // if (generateFinalsCategory(categories) === null){
    //   $('#finals_toggle_button').remove();
    //   $('#finals_toggle_label').text("No Finals Category Available");
    // }
    $('#finals_toggle_button').on('click', function(event){
      if ($('#finals_toggle_button').is(':checked')==true){

        $('#menu_assignment').after($('<tr id="finals_assignment">'))
        $('#finals_assignment').load(FINALS_HTML, function(){
          if (finals_category !== null){
            categories[finals_category['name']] = finals_category;
            $('#finals_assignment > td:nth-child(1) > div > form > select').html('<option value="Finals" selected>Finals</option>');
          } else {
            $(this).find('td:nth-child(1)').prepend("Category of Final?")
            $(this).find('select[name="category_name"]').html(selection_list_categories.join(''));
            $(this).find('td:nth-child(2)').html('% of Grade? <input type="number" id="percent_category_final" style="width: 40px;" min="0" max="99">')
            $(this).find('#percent_category_final').change(function(){
              if ($(this).val() > 100){
                $(this).val(99);
              } else if($(this).val() <= 0){
                $(this).val(1);
              }
              var user_points = initPointObjectCategories();
              var max_points  = initPointObjectCategories();

              $(ASSIGNMENT_TABLE_CSS_PATH +' > tr').not('#menu_assignment, #finals_assignment').each(function(){
                // console.log($(this))
                var assignment = getAssignmentInfo($(this));
                // console.log(assignment)
                user_points[assignment['category']] += assignment['user_score'];
                max_points[assignment['category']]  += assignment['max_score'];
              });
              finals_category = getAssignmentInfo($('#finals_assignment'))['category']

              $('#finals_max_score').val(Math.round((max_points[finals_category]/(1-$(this).val()/100))) - max_points[finals_category]);

            });
            $(this).find('#finals_max_score').change(function(){
              var user_points = initPointObjectCategories();
              var max_points  = initPointObjectCategories();

              $(ASSIGNMENT_TABLE_CSS_PATH +' > tr').not('#menu_assignment').each(function(){
                // console.log($(this))
                var assignment = getAssignmentInfo($(this));
                // console.log(assignment)
                user_points[assignment['category']] += assignment['user_score'];
                max_points[assignment['category']]  += assignment['max_score'];
              });
              finals_category = getAssignmentInfo($('#finals_assignment'))['category']
              $('#percent_category_final').val(Math.round(100 * $(this).val()/max_points[finals_category]))
            })
          }
        });
      } else {
        $('#finals_assignment').remove()
        if (finals_category !== null){
          delete categories["Finals"]
        }
        
      }
    });
    
    $('#add_assignment_button').on('click', function(event){
      createNewAssignment(ASSIGNMENT_TABLE_CSS_PATH, selection_list_categories);
      $('#menu_assignment').prependTo(ASSIGNMENT_TABLE_CSS_PATH);
   });
  }))
  original_grade = $(CLASS_NUMBER_GRADE_CSS_PATH).text().substr(0, 4);

  $(CATEGORIES_CSS_PATH).each(function(){
    category = getCategoryInfo($(this));
    categories[category['name']] = category;
    category_name_list.push(category['name']);
  });
  finals_category = generateFinalsCategory(categories);
 
  
  console.log(categories);

  var selection_list_categories = generateSelectionListCategories(categories);


  
  $(ASSIGNMENT_TABLE_SCORE_CSS_PATH).each(function(){
    createEditableOriginalAssignment($(this));
  });

  startUpdateGrade()
});


//////////////////////////////////////////////////////////////////
///////         Update Grade   ///////////////////////////////////
//////////////////////////////////////////////////////////////////

function updateGrade(){
  var user_points = initPointObjectCategories();
  var max_points  = initPointObjectCategories();

  $(ASSIGNMENT_TABLE_CSS_PATH +' > tr').not('#menu_assignment').each(function(){
    // console.log($(this))
    var assignment = getAssignmentInfo($(this));
    // console.log(assignment)
    user_points[assignment['category']] += assignment['user_score'];
    max_points[assignment['category']]  += assignment['max_score'];
  });

  console.log(user_points)

  var number_grade  = generateNumberGrade(user_points, max_points);
  var letter_grade  = generateLetterGrade(number_grade);


  $(CATEGORIES_CSS_PATH).each(function(){
    updateCategoryScore($(this), user_points, max_points);
  })
  //$(category_element).find('td:nth-child(3)').text();

  // console.log(number_grade - original_grade)
  if(Math.abs(number_grade - original_grade) < .1) {
    $(CLASS_NUMBER_GRADE_CSS_PATH).text((number_grade).toFixed(2) + "%");
  } else {
    $(CLASS_NUMBER_GRADE_CSS_PATH).text((number_grade).toFixed(2) + "%" + "    " + "NOT ORIGINAL GRADE");
  }

  
  $(CLASS_LETTER_GRADE_CSS_PATH).text(letter_grade);
}

function startUpdateGrade(){
  //setInterval('updateGrade()', interval);
  updateGrade();
  $(document).click(function(e){
    updateGrade();
  });
  $(document).keyup(function(e){
    e.preventDefault();
    updateGrade();
  });
}


function getIsWeighted(){
  return $(WEIGHTED_OR_UNWEIGHTED_CSS_PATH).text() === 'Weight:';
}

function createAssignmentAddButton(append_location){
  var assignment_add_button = $('<input/>', { type: 'button',
                                              id: 'add_assignment_button',
                                              value: 'Add New Assignment',
                                            });
  assignment_add_button.css('float', 'left');
  $(append_location).prepend(assignment_add_button);

}

function createFinalsToggleButton(append_location){
  var finals_toggle_button = $('<input>', {type: 'checkbox',
                                           id: 'finals_toggle_button',
                                           label: 'Include Finals Category?',
                                           });
  var finals_toggle_label = $('<label>', { id: 'finals_toggle_label',
                                           for: 'finals_toggle_button',
                                           text: 'Include Finals Category?',
                                           });
  finals_toggle_button = finals_toggle_button.wrap('<div></div>')
  finals_toggle_label = finals_toggle_label.wrap('<div></div>')
  finals_toggle_button.css('float', 'left');
  finals_toggle_label.css('float', 'left');
  $(append_location).prepend(finals_toggle_button); 
  $(append_location).prepend(finals_toggle_label);
}

function getCategoryInfo(category_element){
  var category = {};
  category['name'] = $(category_element).find('td.list_label_grey').text();
  var weight = $(category_element).find('td:nth-child(2)').text();
  weight = weight.substring(0, weight.length-1);
  weight = parseFloat(weight)/100;
  category['weight'] = weight;
  //category['score'] = $(category_element).find('td:nth-child(3)').text();
  return category;
}

function generateSelectionListCategories(category_list){
  var selection_list_categories = [];
  $.each(category_list, function(idx, obj){
    selection_list_categories.push('<option value="'+ obj["name"] +'">'+ obj["name"] +'</option>');
  });
  return selection_list_categories;
}

function generateFinalsCategory(category_list){
  var total_weight = 0;
  $.each(category_list, function(idx, obj){
    total_weight += obj["weight"];
  });
  var final_category = {};
  final_category["name"] = "Finals";
  final_category["weight"] = 1-total_weight;
  if (1-total_weight == 0 || is_weighted == false){
    return null;
  }
  return final_category;
}
function createNewAssignment(append_location, selection_list_categories){
    $(append_location).prepend($('<tr>').load(NEW_ASSIGNMENT_HTML, function(){
    $(append_location).find('.date').text("NEW");
    $(append_location).find('.delete_assignment').first().on('click', function(event){
      $(this).closest('tr').remove();
    });
    console.log(selection_list_categories);
    $(append_location).find('select[name="category_name"]').html(selection_list_categories.join(''));
  }));
}

function createEditableOriginalAssignment(assignment_element){
  var score=0;
  var max_score=0;
  var t = findScores($(assignment_element).text());
  // console.log($(assignment_element).text());
  score=t[0];
  max_score=t[1];

  $(assignment_element).append('\
    <form>\
    <input type="number" name="score" style="width: 40px;" min="0"> /\
     <input type="number" name="max_score" style="width: 40px;" min="0"> \
    <div class="assignment_percent" style="display:inline !important;"></div>\
    </form>'
    );
  if(limited_control && (score!=0 || max_score!=0)){
    $(assignment_element).find('input[name="max_score"]').prop('readonly', true);
    if($(assignment_element).closest('tr').hasClass('highlight')){
      $(assignment_element).find('input[name="max_score"]').css('background-color', '#faf6da');

    }
  }
  var percent = $(assignment_element).find('form > div.assignment_percent');

  $(assignment_element).find('input[name="score"]').val(parseFloat(score));
  $(assignment_element).find('input[name="score"]').text(score);

  $(assignment_element).find('input[name="max_score"]').val(parseFloat(max_score));
  $(assignment_element).find('input[name="max_score"]').text(max_score);
}



function calculateStuff(){      //Love you Andrew Carpenter. Shoutout to DBC Open Theme Hackathon
  return 8*19;
}

function getAssignmentInfo(assignment_element){
  var assignment_score_cell = $(assignment_element).find('td:nth-child(4)');
  // console.log($(assignment_score_cell).find('form > input[type="number"]:nth-child(1)'))
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
    if (!(idx in categories)){
      return;
    }
    if(is_weighted){
      if (max_points[idx] == 0){
        grade_weighted += 0;
      } else{
        grade_weighted += categories[idx]["weight"] * (obj/max_points[idx]);
      }
      total_weight   += categories[idx]["weight"];
    } else {
      user_points_unweighted  += obj;
      max_points_unweighted   += max_points[idx];
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
   points["Finals"] = 0;
   return points;
}

function findScores(text){
  if(text == null){
    return ["0", "0"];
  }
  var scores = text;
  if(scores.indexOf("Excused") != -1){
    return ["0", "0"];
  }
  if(scores.indexOf("/")==-1 && scores.indexOf("-")!=-1){ //Extra Credit
    var extra_points = scores.match(/:.*/g)[0].substring(1);

    return [extra_points, "0"];
  }
  var grade1 = scores.match(/([0-9]|[" "]|[.])+((\/))/g);
  if(grade1 == null || grade1.length == 0){
    return ["0", "0"];
  }
  grade1 = grade1[0];
  var grade= grade1.substring(0, grade1.length-2);

  var grade2 = scores.match(/((\/))+([0-9]|[" "]|[.])*/g);
  grade2 = grade2[0];
  var outOf= grade2.substring(2, grade2.length-1);
  return [grade, outOf];
}

function todayDate() {
    var today_date = new Date();
    var myyear  = today_date.getFullYear();
    var mymonth = today_date.getMonth() + 1;
    var mytoday = today_date.getDate();
    return +mymonth+"/"+mytoday+"/"+myyear.toString().substr(2, 4);
}

function updateCategoryScore(category_element, user_points, max_points){
  var name = $(category_element).find('td.list_label_grey').text();
  //console.log(user_points[name]/max_points[name]);
  var grade = (user_points[name]/max_points[name]) * 100;
  $(category_element).find('td:last-child').text(grade.toFixed(2) + '%');
}
