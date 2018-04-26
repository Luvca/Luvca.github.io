(function() {
  Office.initialize = function(reason) {
    $(document).ready(function() {
      $("#getGroupsButton").click(function() {
        $("#log").val("click");
        Office.context.mailbox.getCallbackTokenAsync({isRest: true}, function(result) {
          if (result.status == Office.AsyncResultStatus.Succeeded) {
            var accessToken = result.value;
            var host = Office.context.mailbox.restUrl;
            var url = host + "/beta/groups";

            $.ajax({
              type: "GET",
              url: url,
              dataType: "json",
              headers: {"Authorization": "Bearer " + accessToken}
            }).done(function(response, textStatus, jqXHR) {
              $("#result").val(JSON.stringify(response));
            }).fail(function(jqXHR, textStatus, errorThrown) {
              $("#result").val("ErrorAjax: " + errorThrown);
            });
          } else {
            $("#result").val("ErrorGetToken: " + result.error.message);
          }
        });
      });
    });
  };
})();
