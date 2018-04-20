$( document ).ready(function() {
    
  $("#vote:first-child").attr("selected", "");
  $("#vote").change(function() {
    if($(this).val() === "My custom option") {
      $("#customOption").show();
      $("#customOption").focus();
    }
    else $("#customOption").hide();
  });
});