if (Meteor.isClient) {
  // counter starts at 0
  Template.submitHTMLForm.events({
    'submit form': function(event){
      event.preventDefault();
      var userHTML = event.target.userHTML.value;
      var gradebookHTML = $('#gradebook').contents().find('html');
      (function removeLink(){
        if(gradebookHTML.find('#container_content').length){
          gradebookHTML.find('a[href]').on('click', function(event){
            event.preventDefault();
          });
          $.getScript('public/contentscript.js');
        } else{
          console.log('hi')
          setTimeout(removeLink,100);
        }
      })();

      gradebookHTML.html(userHTML);

    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
