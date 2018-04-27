var msalconfig = {
  clientID: "6caa49d2-ca6a-4edd-9f44-1fe9e79d6457",
  redirectUri: location.origin
};

//var graphApiEndpoint = "https://graph.microsoft.com/beta/groups";
var graphApiEndpoint = "https://graph.microsoft.com/v1.0/me";
var graphApiScopes = ["https://graph.microsoft.com/user.read"];
var userAgentApplication = new Msal.UserAgentApplication(msalconfig.clientID, null, loginCallback, {
  redirectUri: msalconfig.redirectUri
});
if (userAgentApplication.redirectUri) {
  userAgentApplication.redirectUri = msalconfig.redirectUri;
}

(function() {
  Office.initialize = function(reason) {
    $(document).ready(function() {
      if (!userAgentApplication.isCallback(window.location.hash) && window.parent === window && !window.opener) {
        var user = userAgentApplication.getUser();
        if (user) {
          callGraphApi();
        }
      }
      /*
      $("#getGroupsButton").click(function() {
        Office.context.mailbox.getCallbackTokenAsync({isRest: true}, function(result) {
          if (result.status == Office.AsyncResultStatus.Succeeded) {
            var accessToken = result.value;
            var host = Office.context.mailbox.restUrl;
            //var url = host + "/beta/groups";
            var url = "https://graph.microsoft.com/beta/groups";
            $("#log").val(url);

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
      */
    });
  };
})();

function callGraphApi() {
  var user = userAgentApplication.getUser();
  if (!user) {
    userAgentApplication.loginRedirect(graphApiScopes);
  } else {
    var userInfoElement = $("#userInfo");
    userInfoElement.parentElement.classList.remove("hidden");
    userInfoElement.innerHTML = JSON.stringify(user, null, 4);
    $("#signOutButton").classList.remove("hidden");
    var graphCallResponseElement = $("#graphResponse");
    graphCallResponseElement.parentElement.classList.remove("hidden");
    graphCallResponseElement.innerText = "Calling graph...";
    userAgentApplication.acquireTokenSilent(graphApiScopes)
      .then(function (token) {
        callWebApiWithToken(graphApiEndpoint, token, graphCallResponseElement, $("#accessToken"));
      }, function (error) {
        if (error) {
          userAgentApplication.acquireTokenRedirect(graphApiScopes);
        }
      });
  }
}

function loginCallback(errorDesc, token, error, tokenType) {
  if (errorDesc) {
    showError(msal.authority, error, errorDesc);
  } else {
    callGraphApi();
  }
}

function showError(endpoint, error, errorDesc) {
  var formattedError = JSON.stringify(error, null, 4);
  if (formattedError.length < 3) {
    formattedError = error;
  }
  $("#errorMessage").innerHTML = "An error has occurred:<br/>Endpoint: " + endpoint + "<br/>Error: " + formattedError + "<br/>" + errorDesc;
  console.error(error);
}

function callWebApiWithToken(endpoint, token, responseElement, showTokenElement) {
  var headers = new Headers();
  var bearer = "Bearer: " + token;
  headers.append("Authorization", bearer);
  var options = {
    method: "GET",
    headers: headers
  };

  fetch(endpoint, options)
    .then(function (response) {
      var contentType = response.headers.get("content-type");
      if (response.status === 200 && contentType && contentType.indexOf("application/json") !== -1) {
        response.json()
          .then(function (data) {
            console.log(data);
            responseElement.innerHTML = JSON.stringify(data, null, 4);
            if (showTokenElement) {
              showTokenElement.parentElement.classList.remove("hidden");
              showTokenElement.innerHTML = token;
            }
          })
          .catch(function (error) {
            showError(endpoint, error);
          });
      } else {
        response.json()
          .then(function (data) {
            showError(endpoint, data);
          })
          .catch(function (error) {
            showError(endpoint, error);
          });
      }
    })
    .catch(function (error) {
      showError(endpoint, error);
    });
}

function signOut() {
  userAgentApplication.logout();
}
