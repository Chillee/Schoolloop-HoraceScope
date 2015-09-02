if (Meteor.isClient) {
  // counter starts at 0
  Template.submitHTMLForm.events({
    'submit form': function(event){
      event.preventDefault();
      var userHTML = event.target.userHTML.value;
      $('#gradebook').contents().find('html').html(userHTML + '<script src="contentscript.js"></script>');
      
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
