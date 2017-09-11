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


$(document).ready(function(){
  /* コマンドカードクリック時に、使用済みクラスを付ける */
  $(".commandcard").click(function(){
    $(this).toggleClass("used");
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
  });
});
