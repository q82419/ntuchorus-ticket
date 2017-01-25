var ticketTable = {};
var selectedTicketTable = {};
var salerTable = [];
var payTable = {};
var creditTable = {};
var departmentTable = ['Soprano', 'Alto', 'Tenor', 'Bass', '團外', '老師', '友團', '老人'];

function select(a) {
    var click_id = a.attr('id');
    if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['saleid'] != null && !(click_id in selectedTicketTable)){
        for(var id in selectedTicketTable)
            $('#' + id).attr('class', 'seat seat_type_0');
        selectedTicketTable = {};

        var sale_id = ticketTable[click_id]['saleid'];
        var department = payTable[sale_id]['department'];
        $('#submit_buyer').val(payTable[sale_id]['buyer']);
        $('#submit_department').val(departmentTable[department]);
        $('#submit_date').val(payTable[sale_id]['time']);
        $('#submit_saler').val(salerTable[payTable[sale_id]['saler']]);
        if(payTable[sale_id]['paymode'] == 0){
            $('#submit_paymode').val('付清');
            $('#total_priceowe').html('0元');
        }
        else{
            $('#submit_paymode').val('賒帳');
            var oweprice = payTable[sale_id]['totalprice'] - payTable[sale_id]['discount'];
            if(sale_id in creditTable)
                oweprice -= creditTable[sale_id];
            $('#total_priceowe').html(oweprice + '元');
        }
        $('#submit_discount').val(payTable[sale_id]['discount']);
        $('#total_price').html(payTable[sale_id]['totalprice'] - payTable[sale_id]['discount'] + '元');

        for(var id in ticketTable){
            if(ticketTable[id]['saleid'] == sale_id){
                $('#' + id).attr('class', 'seat seat_select');
                selectedTicketTable[id] = 1;
            }
        }
    }
    else if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['preserve'] == 5 && !(click_id in selectedTicketTable)){
        for(var id in selectedTicketTable)
            $('#' + id).attr('class', 'seat seat_type_0');
        selectedTicketTable = {};

        var sale_id = ticketTable[click_id]['saleid'];
        var sale_price = 0;
        $('#submit_buyer').val('系統票');
        $('#submit_department').val('');
        $('#submit_date').val('');
        $('#submit_saler').val('');
        $('#submit_paymode').val('付清');
        $('#total_priceowe').html('0元');
        $('#submit_discount').val('');

        for(var id in ticketTable){
            if(ticketTable[id]['preserve'] == 5 && ticketTable[id]['state'] == 2){
                $('#' + id).attr('class', 'seat seat_select');
                selectedTicketTable[id] = 1;
                sale_price += ticketTable[id]['price'];
            }
        }
        $('#total_price').html(sale_price + '元');
    }
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'getOrder'};
            connectServer('POST',
                          JSON.stringify(dataset),
                          'order',
                          function(data){
                if(data["status"] == "0"){
                    $('#update_date').html('更新時間：' + data['message']['time'] + '　　　瀏覽次數：' + data['message']['counter']);
                    $('#update_message').html(data['message']['message']);
                    $('#requesting').hide();
                    $('a[id^=seat_]').addClass('seat_type_2');
                    
                    for(var i = 0; i < data['manager'].length; i++){
                        if(data['manager'][i]['department'] < 5)
                            salerTable[data['manager'][i]['department']] = data['manager'][i]['name'];
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
                            if(data['ticket'][i]['saleid'] != null || data['ticket'][i]['preserve'] == 5)
                                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_0');
                            else
                                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_1');
                        }
                    }
                    for(var i = 0; i < data['paylist'].length; i++)
                        payTable[data['paylist'][i]['id']] = data['paylist'][i];
                    for(var i = 0; i < data['creditlist'].length; i++)
                        creditTable[data['creditlist'][i]['saleid']] = data['creditlist'][i]['payprice'];

                    $('#message').show();
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
        });
    });
});

