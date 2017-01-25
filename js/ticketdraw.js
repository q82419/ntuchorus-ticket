var ticketTable = {};
var editTicketTable = {};
var priceSelected = 0;
var showTable = {'0': true, '1': false, '2': false, '3': false, '5': false};

function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    
    $('#' + id).attr('class', 'seat');
    if(showTable[finalPreserve]) {
        if(id in editTicketTable){
            $('#' + id).addClass('seat_select');
        }
        else{
            if(finalState == 2)
                $('#' + id).addClass('seat_type_5');
            else if(finalState == 1)
                $('#' + id).addClass('seat_type_4');
            else
                $('#' + id).addClass('seat_type_' + finalType);
        }
    }
    else {
        if(id in editTicketTable){
            delete editTicketTable[id];
            if(ticketTable[id]['type'] < 3 && ticketTable[id]['preserve'] < 5)
                priceSelected -= ticketTable[id]['price'] * 0.9;
            else
                priceSelected -= ticketTable[id]['price'];
            $('#form_label').html('選取總金額：' + priceSelected + '元');
        }
        $('#' + id).addClass('seat_type_6');
    }
}

function showSaleData(box) {
    if(box.checked)
        showTable[box.value] = true;
    else
        showTable[box.value] = false;
    Object.keys(ticketTable).forEach(function(key, idx) {
        updateSeat(key);
    });
}

function select(a) {
    var click_id = a.attr('id');
    var click_price = ticketTable[click_id]['price'];
    if(ticketTable[click_id]['type'] < 3 && ticketTable[click_id]['preserve'] < 5)
        click_price *= 0.9;
    
    if(ticketTable[click_id]['preserve'] != 4 && showTable[ticketTable[click_id]['preserve']]){
        if(click_id in editTicketTable){
            delete editTicketTable[click_id];
            priceSelected -= click_price;
        }
        else{
            editTicketTable[click_id] = 1;
            priceSelected += click_price;
        }
        updateSeat(click_id);
    }
    $('#form_label').html('選取總金額：' + priceSelected + '元');
}

function commitData(mode){
    var dataset = [];
    for(var id in editTicketTable){
        dataset.push(ticketTable[id]['id']);
    }
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'drawTicket', 'data': dataset, 'mode': mode};
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
                    $('#update_date').html('更新時間：' + data['message']['time'] + '　　　瀏覽次數：' + data['message']['counter']);
                    $('#update_message').html(data['message']['message']);
                    $('#requesting').hide();

                    for(var i = 0; i < data['ticket'].length; i++){
                        var seat_id = 'seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
                        var seat_state = parseInt(data['ticket'][i]['state']);
                        var seat_type = parseInt(data['ticket'][i]['type']);
                        var seat_preserve = parseInt(data['ticket'][i]['preserve']);
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
                    $('#floor_type').show();
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
            $('#submit_clear').click(function(){
                commitData(0);
                return false;
            });
            $('#submit_occupy').click(function(){
                commitData(1);
                return false;
            });
            $('#submit_sale').click(function(){
                commitData(2);
                return false;
            });

        });
    });
});

