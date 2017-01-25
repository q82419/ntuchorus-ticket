var ticketTable = {};
var editTicketTable = {};
var priceSelected = 0;

function inputValidNumber(e, pnumber){
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    if($(e).val() == '')
        $(e).val('0');
    $('#total_price').html(priceSelected - parseInt($(e).val()) + '元');
    return false;
}

function updateSeat(id) {
    $('#' + id).attr('class', 'seat');
    if(id in editTicketTable)
        $('#' + id).addClass('seat_select');
    else{
        $('#' + id).addClass('seat_type_0');
    }
}

function select(a) {
    var click_id = a.attr('id');
    var click_price = ticketTable[click_id]['price'];
    if(ticketTable[click_id]['type'] < 3 && ticketTable[click_id]['preserve'] != 5)
        click_price *= 0.9;
    if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['saleid'] == null && ticketTable[click_id]['preserve'] != 5){
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
    $('#total_price').html(priceSelected - parseInt($('#submit_discount').val()) + '元');
}

function commitData(){
    if($('#submit_buyer').val() == "")
        alert('姓名欄不得為空白');
    else if(Object.keys(editTicketTable).length == 0)
        alert('請選取座位');
    else if($('#submit_date').val() == "")
        alert('日期不得為空白');
    else{
        var dataset = [];
        for(var id in editTicketTable){
            dataset.push(ticketTable[id]['id']);
        }
        fbsdkCheckLogin(function(fbID, fbToken){
            var commit = {'id': fbID, 'token': fbToken, 'cmd': 'saleTicket', 'data': dataset,
                          'buyer': $('#submit_buyer').val(), 'department': parseInt($('#submit_department select').val()),
                          'time': $('#submit_date').val(), 'saler': parseInt($('#submit_saler select').val()),
                          'paymode': parseInt($('input[name="paymode"]:checked').val()), 'discount': parseInt($('#submit_discount').val())};

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
    }
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
                    
                    for(var i = 0; i < data['manager'].length; i++){
                        if(data['manager'][i]['department'] < 5)
                            $('#submit_saler select').append('<option value="' + data['manager'][i]['department'] + '">' + data['manager'][i]['name'] + '</option>\n');
                    }
                    for(var i = 0; i < data['ticket'].length; i++){
                        var seat_id = 'seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
                        var arr = {};
                        arr['id'] = parseInt(data['ticket'][i]['id']);
                        arr['state'] = parseInt(data['ticket'][i]['state']);
                        arr['type'] = parseInt(data['ticket'][i]['type']);
                        arr['preserve'] = parseInt(data['ticket'][i]['preserve']);
                        arr['price'] = parseInt(data['ticket'][i]['price']);
                        arr['saleid'] = data['ticket'][i]['saleid'];
                        ticketTable[seat_id] = arr;
                        if(arr['state'] == 2){
                            if(data['ticket'][i]['saleid'] == null && data['ticket'][i]['preserve'] != 5)
                                $('#' + seat_id).addClass('seat_type_0');
                            else
                                $('#' + seat_id).addClass('seat_type_1');
                        }
                        else{
                            $('#' + seat_id).addClass('seat_type_2');
                        }
                    }
                    $('#message').show();
                    $('#floor_4').show();
                    $('#floor_3').show();
                    $('#floor_2').show();
                    $('#form').show();
                    var dateArr = new Date().toLocaleDateString().split('/');
                    dateArr[1] = dateArr[1].length > 1 ? dateArr[1] : '0' + dateArr[1];
                    dateArr[2] = dateArr[2].length > 1 ? dateArr[2] : '0' + dateArr[2];
                    $('#submit_date').val(dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2]);
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
            $('#submit').click(function(){
                commitData();
                return false;
            });

        });
    });
});

