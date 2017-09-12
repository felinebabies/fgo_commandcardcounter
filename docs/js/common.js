/* 指定番のサーヴァントの名前を更新する */
function update_servant_name(slotnum) {
  var slotname = "servant_display_" + slotnum;
  var servantname = $("#servant_" + slotnum + "_name").val();
  if(servantname == ""){
    servantname = "empty";
  }
  $("#" + slotname + " .name").text(servantname);
}

/* 指定番のサーヴァントのコマンドカード構成を更新する */
function update_servant_commandcards(slotnum) {
  var slotname = "servant_display_" + slotnum;

  var typearr = ["quick", "arts", "buster"];

  var commandsarr = [];
  $.each(typearr, function(i, val){
    var selector = "#servant_" + slotnum + "_" + val;
    var cardnum = parseInt($(selector).val(), 10);
    /* 数値が0未満なら1にする、3を超えていたら3にする */
    if(cardnum <= 0) {
      cardnum = 1;
      $(selector).val(cardnum);
    }
    if(cardnum > 3) {
      cardnum = 3;
      $(selector).val(cardnum);
    }

    /* 配列に指定数分入れる */
    for(var i = 0 ; i < cardnum ; i++){
      commandsarr.push(val);
    }
  });

  /* 表示部のカード種別をリセットする */
  $("#" + slotname + " .commandcard").each(function(){
    for(var i = 0 ; i < typearr.length ; i++){
      $(this).removeClass(typearr[i]);
    }
  });

  /* 配列の大きさが5なら、表示部を更新する */
  if(commandsarr.length == 5){
    $.each(commandsarr, function(i, val){
      $("#" + slotname + " .commandcard:eq(" + i + ")").addClass(val);
    });
  }

}

/* 指定番のサーヴァント情報を更新する */
function update_servant_info(servantslot) {
  var slotnum = parseInt(servantslot, 10);

  /* 名前の更新 */
  update_servant_name(slotnum);

  /* コマンドカードの更新 */
  update_servant_commandcards(slotnum);
}

function reset_next_hand(){
  /* 次ターン確定コマンドカードをリセット */
  $("#cardleft .commandcard").each(function(){
    var typearr = ["quick", "arts", "buster"];

    $(this).text("");
    for(var i = 0 ; i < typearr.length ; i++){
      $(this).removeClass(typearr[i]);
    }
  });
  $("#cardleft > .servant_label > .label").each(function(){
    $(this).text("");
  });
}

/* 次ターンの手札が確定できるかを確認する */
function check_next_hand(){
  /* 次ターン確定コマンドカードをリセット */
  reset_next_hand();

  var nexthandarr = [];
  for(var i = 0 ; i < 3 ; i++){
    /* パーティーの先頭から3人までのコマンドカードを集計 */
    var slotname = "servant_display_" + (i + 1);
    $("#" + slotname + " .commandcard").each(function(){
      if(!($(this).hasClass("used"))){
        var cardtype = $(this).attr("class").replace("commandcard","").trim();
        nexthandarr.push({
          "name" : $("#" + slotname + " .name").text(),
          "type" : cardtype
        });
      }
    });
  }

  /* 未使用カードが5枚丁度なら、次の手札が確定 */
  if(nexthandarr.length == 5){
    console.log(nexthandarr);
    $.each($("#cardleft .commandcard"), function(i, val){
      $(val).addClass(nexthandarr[i]["type"]);
      $("#cardleft > .servant_label > .label:eq(" + i +  ")").text(nexthandarr[i]["name"]);
    });
  }
}


$(document).ready(function(){
  /* コマンドカードクリック時に、使用済みクラスを付ける */
  $(".commandcard").click(function(){
    $(this).toggleClass("used");

    /* 次ターンの手札が確定できるかを確認する */
    check_next_hand();
  });


  /* パーティー情報編集時の挙動 */
  for(var i = 0 ; i < 6 ; i++) {
    var slotnum = i + 1;
    (function(targetnum){
      $("#servant_" + targetnum + "_name ," +
      "#servant_" + targetnum + "_quick ," +
      "#servant_" + targetnum + "_arts ," +
      "#servant_" + targetnum + "_buster"
      ).change(function(){
        update_servant_info(targetnum);
      });
    })(slotnum);
  }

  /* リセットボタン押下時の挙動 */
  $("#resetcount").click(function(){
    $(".commandcard").each(function(){
      $(this).removeClass("used");
    });

    /* 次ターンの確定手札をリセット */
    reset_next_hand();
  });
});
