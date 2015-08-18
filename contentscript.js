var GRADEBOOK_BODY_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6)';

var ASSIGNMENT_TABLE_HEADER_CSS_PATH = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)';
var ASSIGNMENT_TABLE_SCORE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)';
var ASSIGNMENT_TABLE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody';

var CLASS_LETTER_GRADE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(4)';
var CLASS_NUMBER_GRADE_CSS_PATH = '#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(2)';

console.log("ayyy")
$(document).on('ready',function(){
	/*$('.page_title').on('click',function(event){    ///jquery selector - .on('event type' function to when event is triggered)
		event.preventDefault();
		console.log("sweet dealz yo"); 
		var testNumber = calculateStuff();
		console.log(testNumber); }
	);*/

	var new_button = $('<input/>', { type: "button", id: "add_assignment_button", value: "Add New Assignment" });
	$(ASSIGNMENT_TABLE_CSS_PATH).append(new_button); 

	/*new_button = $('<input/>', { type: "button", id: "update_grade_button", value: "Update Your Grade" });
	$(ASSIGNMENT_TABLE_HEADER_CSS_PATH).append(new_button);*/

	/*$('#update_grade_button').on('click', function(event){
		event.preventDefault();
		var cur_points = 0.0;
		var max_points = 0.0;
		$(ASSIGNMENT_TABLE_SCORE_CSS_PATH).each(function(){
			var user_score = $(this).find('form > input[type="number"]:nth-child(1)').val();
			var max_score = $(this).find('form > input[type="number"]:nth-child(2)').val();

			user_score = parseFloat(user_score);
			max_score = parseFloat(max_score);
			if(isNaN(user_score)){
				user_score = 0;
			}
			if(isNaN(max_score)){
				max_score = 0;
			}
			console.log(max_score);
			cur_points += user_score;
			max_points += max_score;
			

			var grade_scale=['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
			var grade = (cur_points/max_points) * 100;
			var letter_grade = (grade-60)/3.33333333333333333333333;
			letter_grade = Math.min(letter_grade, grade_scale.length-1);
			letter_grade = Math.max(letter_grade, 0);
			letter_grade = Math.ceil(letter_grade);
			console.log(letter_grade);

			$(CLASS_LETTER_GRADE_CSS_PATH).text(((cur_points/max_points) * 100).toFixed(2) + "%");
			$(CLASS_NUMBER_GRADE_CSS_PATH).text(grade_scale[letter_grade]);
		});
		
	});*/
	$('#add_assignment_button').on('click', function(event){
		event.preventDefault();

		$(ASSIGNMENT_TABLE_CSS_PATH).append($('<tr>').load(chrome.extension.getURL("new_assignment.html"), function(){
			$(".date").text(todaydate);
		}));


		$('#add_assignment_button').appendTo(ASSIGNMENT_TABLE_CSS_PATH);

	});


	$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)").each(function(){
		//$(this).attr('contentEditable', 'true');
		var score=0;
		var max_score=0;
		console.log($(this).text());
		var t = findScores($(this).text());
		score=t[0];
		max_score=t[1];
		console.log(score, max_score);
		$(this).append('<form><input type="number" name="score" style="width: 75px;" min="1"> / <input type="number" name="max_score" style="width: 75px;" min="1"></form>');
		//#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr:nth-child(1) > td:nth-child(4) > form > input[type="number"]:nth-child(2)
		$(this).find('input[name="score"]').val(parseInt(score));
		$(this).find('input[name="score"]').text(score);

		$(this).find('input[name="max_score"]').val(parseInt(max_score));
		$(this).find('input[name="max_score"]').text(max_score);
		//console.log($(this).text());
	});
	startUpdateGrade(500);
})


function calculateStuff(){			//Love you Andrew Carpenter
	return 8*19;
}

function updateGrade(){
	var cur_points = 0.0;
	var max_points = 0.0;
	$(ASSIGNMENT_TABLE_SCORE_CSS_PATH).each(function(){
		var user_score = $(this).find('form > input[type="number"]:nth-child(1)').val();
		var max_score = $(this).find('form > input[type="number"]:nth-child(2)').val();

		user_score = parseFloat(user_score);
		max_score = parseFloat(max_score);
		if(isNaN(user_score)){
			user_score = 0;
		}
		if(isNaN(max_score)){
			max_score = 0;
		}
		console.log(max_score);
		cur_points += user_score;
		max_points += max_score;
		

		var grade_scale=['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
		var grade = (cur_points/max_points) * 100;
		var letter_grade = (grade-60)/3.33333333333333333333333;
		letter_grade = Math.min(letter_grade, grade_scale.length-1);
		letter_grade = Math.max(letter_grade, 0);
		letter_grade = Math.ceil(letter_grade);
		console.log(letter_grade);

		$(CLASS_LETTER_GRADE_CSS_PATH).text(((cur_points/max_points) * 100).toFixed(2) + "%");
		$(CLASS_NUMBER_GRADE_CSS_PATH).text(grade_scale[letter_grade]);
	});
}

function startUpdateGrade(interval){
	setInterval('updateGrade()', interval);
}

function findScores(text){
	var scores = text;
	if(scores.indexOf("Excused") != -1){
		return -1, -1;
	}
	var grade1 = scores.match(/([0-9]|[" "]|[.])+((\/))/g);
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
