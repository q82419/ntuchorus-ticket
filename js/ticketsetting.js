var ticketTable = {};
var editTicketTableType = {};
var editTicketTablePreserve = {};
var editSelector = 0;
/* 10: 400  11: 600  12: 800  13: 1200 14: vip */
/* 20: none 21: teacher 22: friend 23:old 24: vip 25: system */
var vType = {0: 400, 1: 600, 2: 800, 3: 1200, 4: 0};

function pickSelector(a) {
    var id = a.find('div[class^=graphicon_]').attr('class').split('_');
    if(id[1] == 'type')
        editSelector = 10 + parseInt(id[2]);
    else
        editSelector = 20 + parseInt(id[2]);
    return false;
}


function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    if(id in editTicketTableType)
        finalType = editTicketTableType[id][0];
    if(id in editTicketTablePreserve)
        finalPreserve = editTicketTablePreserve[id];

    $('#' + id).attr('class', 'seat');
    if(finalPreserve > 0){
        $('#' + id).addClass('seat_preserve_' + finalPreserve);
        if($('#isShowSaled').prop('checked')){
            if(finalState == 0)
                $('#' + id).addClass('seat_type_' + finalType);
            else
                $('#' + id).addClass('seat_state_' + finalState);
        }
        else
            $('#' + id).addClass('seat_type_' + finalType);
    }
    else{
        $('#' + id).addClass('seat_type_' + finalType);
        if($('#isShowSaled').prop('checked')){
            if(finalState == 0){
                $('#' + id).addClass('seat_type_' + finalType)
                           .addClass('seat_type_b_' + finalType);
            }
            else {
                $('#' + id).addClass('seat_state_' + finalState)
                           .addClass('seat_state_b_' + finalState);
            }
        }
        else
            $('#' + id).addClass('seat_type_b_' + finalType);
    }
}

function showSaleData(box) {
        Object.keys(ticketTable).forEach(function(key, idx) {
            updateSeat(key);
        });
}

function select(a) {
    var click_id = a.attr('id');
    if(editSelector >= 10 && editSelector < 20){ //type
        if(click_id in editTicketTableType)
            delete editTicketTableType[click_id];
        else {
            editTicketTableType[click_id] = [editSelector % 10, vType[editSelector % 10]];
        }
    }
    else if(editSelector >= 20 && editSelector < 30){ //preserve
        if(click_id in editTicketTablePreserve)
            delete editTicketTablePreserve[click_id];
        else {
            editTicketTablePreserve[click_id] = editSelector % 10;
        }
    }
    updateSeat(click_id);
    return false;
}

function commitData(){
    var dataset = {};
    for(var id in editTicketTableType)
        dataset[id] = {'id': ticketTable[id]['id'], 'type': editTicketTableType[id][0], 'price': editTicketTableType[id][1], 'preserve': ticketTable[id]['preserve']};
    for(var id in editTicketTablePreserve){
        if(id in dataset)
            dataset[id]['preserve'] = editTicketTablePreserve[id];
        else
            dataset[id] = {'id': ticketTable[id]['id'], 'type': ticketTable[id]['type'], 'price': ticketTable[id]['price'], 'preserve': editTicketTablePreserve[id]};
    }
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'setTicket', 'data': dataset};
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

function commitClear(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'clearPreserve'};
        connectServer('POST',
                      JSON.stringify(commit),
                      'edit',
                      function(data){
            if(data["status"] == "0"){
                window.location.reload();
            }
            else{
                $('#requesting').html('寫入失敗');
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
                    $('#update_date').html('更新時間：' + data['message']['time'] + '　　　瀏覽次數：' + data['message']['counter']);
                    $('#update_message').html(data['message']['message']);
                    $('#requesting').hide();

                    for(var i = 0; i < data['ticket'].length; i++){
                        var seat_id = 'seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
                        var seat_state = parseInt(data['ticket'][i]['state']);
                        var seat_type = parseInt(data['ticket'][i]['type']);
                        var arr = {};
                        arr['id'] = parseInt(data['ticket'][i]['id']);
                        arr['state'] = parseInt(data['ticket'][i]['state']);
                        arr['type'] = parseInt(data['ticket'][i]['type']);
                        arr['preserve'] = parseInt(data['ticket'][i]['preserve']);
                        arr['price'] = parseInt(data['ticket'][i]['price']);
                        ticketTable[seat_id] = arr;
                        updateSeat(seat_id);
                    }
                    $('#message').show();
                    $('#selectors').show();
                    $('#floor_4').show();
                    $('#floor_3').show();
                    $('#floor_2').show();
                    $('#form').show();
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

            $('a[id^=seat_]').click(function(){
                select($(this));
                return false;
            });
            $('div[class=block_graph] a').click(function(){
                pickSelector($(this));
                return false;
            });
            $('#submit_change').click(commitData);
            $('#submit_clear').click(commitClear);
        });
    });
});

