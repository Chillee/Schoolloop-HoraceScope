console.log("hi")
$(document).on('ready',function(){
	/*$('.page_title').on('click',function(event){    ///jquery selector - .on('event type' function to when event is triggered)
		event.preventDefault();
		console.log("sweet dealz yo"); 
		var testNumber = calculateStuff();
		console.log(testNumber); }
	);*/
	/*$("script").each(function(){
		if($(this).text().indexOf("document.body.contentEditable")!=-1){
			$(this).text("");
			console.log("yayy");
		}
		console.log("yay");
		console.log($(this).text());
		console.log($(this).text().indexOf("document.body.contentEditable"));
	})*/
	var new_button = $('<input/>', { type: "button", id: "add_assignment", value: "Add New Assignment" });

	$("#container_content > div.content_margin > table:nth-child(6)").append(new_button); 

	new_button = $('<input/>', { type: "button", id: "update_grades", value: "Update Your Grade" });
	$('#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1)').append(new_button);

	$('#update_grades').on('click', function(event){
		event.preventDefault();
		var cur_points = 0.0;
		var max_points = 0.0;
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)").each(function(){
		file:///Users/apprentice/Documents/GradeTrac/test.html#//$(this).attr('contentEditable', 'true');
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
			$('#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(4)').text(((cur_points/max_points) * 100).toFixed(2) + "%");

			var grade_scale=['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
			var grade = (cur_points/max_points) * 100;
			var letter_grade = (grade-60)/3.33333333333333333333333;
			letter_grade = Math.min(letter_grade, grade_scale.length-1);
			letter_grade = Math.max(letter_grade, 0);
			letter_grade = Math.ceil(letter_grade);
			console.log(letter_grade);
			$('#container_content > div.content_margin > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(1) > b:nth-child(2)').text(grade_scale[letter_grade]);
		});
		
	});
	$('#add_assignment').on('click', function(event){
		event.preventDefault();
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody").append('<tr><td><div class="float_l padding_r5" style="min-width: 105px;"><form><input type="text" name = "category_name" style="width: 100px;" value="Participation"><br><a href="#" title="New Assignment"><input type="text" name = "assignment_name" value = "New Assignment" style="width: 100px;"></form></a></div></td>');
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr").last().append('<td style="width:100%;"></td>');
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr").last().append('<td>8/16/15<br></td>');
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr").last().append('<td nowrap>\
			 	<div>\
		            </div>\
		\
		\
		<form><input type="number" name="score" style="width: 25px;" min="0" value=1 text="1"> / <input type="number" name="max_score" style="width: 25px;" min="0" value=1 text="1"></form></td></tr>');
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr").last().append('<td class="list_text">\
   		<div style="width: 125px;"></div>\
		\
		</td>');
		$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)").each(function(){
		//$(this).attr('contentEditable', 'true');



		/*$(this).find('input[name="score"]').val(0);
		$(this).find('input[name="score"]').text("0");
		$(this).find('input[name="max_score"]').val(0);
		$(this).find('input[name="max_score"]').text("0");*/
		console.log($(this).text());
	});
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
		$(this).append('<form><input type="number" name="score" style="width: 25px;" min="1"> / <input type="number" name="max_score" style="width: 25px;" min="1"></form>');
		//#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr:nth-child(1) > td:nth-child(4) > form > input[type="number"]:nth-child(2)
		$(this).find('input[name="score"]').val(parseInt(score));
		$(this).find('input[name="score"]').text(score);

		$(this).find('input[name="max_score"]').val(parseInt(max_score));
		$(this).find('input[name="max_score"]').text(max_score);
		//console.log($(this).text());
	});
})


function calculateStuff(){
	return 8*19;
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
//#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr:nth-child(1) > td:nth-child(4) > form > input[type="number"]:nth-child(1)
	$("#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr > td:nth-child(4)").each(function(){
		//$(this).attr('contentEditable', 'true');
		console.log($(this).find('form > input[type="number"]:nth-child(2)').val());
		//console.log($(this).text());
	});
	//#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr:nth-child(5) > td:nth-child(4) > form > input[type="number"]:nth-child(1)

//#container_content > div.content_margin > table:nth-child(6) > tbody > tr > td.home_left > table > tbody > tr:nth-child(3) > td:nth-child(4)