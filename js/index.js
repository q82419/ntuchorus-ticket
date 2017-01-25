
function inputValidNumber(e, pnumber){
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    return false;
}

function commitMessage(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'setMessage', 'message': $('#input_message').val()};
        connectServer('POST',
                      JSON.stringify(commit),
                      'edit',
                      function(data){
            if(data["status"] == "0"){
                window.location.reload();
            }
            else if(data["status"] == "2"){
                alert('權限不足');
            }
            else{
                alert('寫入失敗，請稍候再試或聯絡管理員');
            }
        });
    });
    return false;
}

function commitDM(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'setDM', 'sale': $('#input_DM_given').val(), 'total': $('#input_DM_total').val()};
        connectServer('POST',
                      JSON.stringify(commit),
                      'edit',
                      function(data){
            if(data["status"] == "0"){
                window.location.reload();
            }
            else if(data["status"] == "2"){
                alert('權限不足');
            }
            else{
                alert('寫入失敗，請稍候再試或聯絡管理員');
            }
        });
    });
    return false;
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'id': fbID, 'token': fbToken};
            connectServer('POST',
                          JSON.stringify(dataset),
                          'request',
                          function(data){
                if(data["status"] == "0"){
                    $('#input_message').val(data['message']['message']);
                    $('#requesting').hide();

                    $('#input_DM_given').val(data['DM']['sale']);
                    $('#input_DM_total').val(data['DM']['total']);
                    $('#message').show();
                    $('#DM').show();
                    $('#manager').show();
                }
                else if(data["status"] == '1'){
                    $('#requesting').html('目前非購票時段');
                }
                else if(data["status"] == '2'){
                    $('#requesting').html('權限不足');
                }
                else{
                    $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
                }
            });

            $('#submit_message').click(commitMessage);
            $('#submit_DM').click(commitDM);
        });
    });
});

