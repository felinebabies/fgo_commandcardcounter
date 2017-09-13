/* 指定番のサーヴァントの名前を更新する */
function update_servant_name(slotnum) {
  var slotname = "servant_display_" + slotnum;
  var servantname = $("#servant_" + slotnum + "_name").val();
  /* セパレータ文字列があればエスケープする */
  servantname = servantname.replace(/<>/g, "＜＞");
  $("#servant_" + slotnum + "_name").val(servantname);

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

/* 文字列化パーティー情報を取得する */
function get_party_str(){
  var typearr = ["quick", "arts", "buster"];

  var partystrarr = [];
  for(var i = 0 ; i < 6 ; i++){
    /* カード枚数 */
    var servant_str = "";
    $.each(typearr, function(index, val){
      var selector = "#servant_" + (i + 1) + "_" + val;
      var cardnum = $(selector).val();
      servant_str += cardnum;
    });

    /* サーヴァント名 */
    var servantname = $("#servant_" + (i + 1)  + "_name").val();

    servant_str += servantname;

    partystrarr.push(servant_str);
  }
  return(partystrarr.join("<>"));
}

/* パーティー情報リンクの更新 */
function update_party_encoded_url(){
  /* パーティー情報の文字列化 */
  var partystr = get_party_str();

  /* パーティー情報のBASE64エンコード */
  var encodedstr = btoa(unescape(encodeURIComponent(partystr)));

  /* URLへのパラメータ付加 */
  var thispageurl = $(location).attr("protocol");
  thispageurl += "://";
  thispageurl += $(location).attr("host");
  thispageurl += $(location).attr("pathname");

  var linkurl = thispageurl + "?party=" + encodedstr;

  $("#party_encoded_url").text(linkurl);
}

/* 指定番のサーヴァント情報を更新する */
function update_servant_info(servantslot) {
  var slotnum = parseInt(servantslot, 10);

  /* 名前の更新 */
  update_servant_name(slotnum);

  /* コマンドカードの更新 */
  update_servant_commandcards(slotnum);

  /* パーティー情報リンクの更新 */
  update_party_encoded_url();
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

/* クエリパラメータpartyが指定されていたら、パーティー情報をデコードする */
function loadpartysettings(){
  var typearr = ["quick", "arts", "buster"];
  var qparam = $(location).attr("search");
  if(qparam != ""){
    var slicedparam = qparam.slice(1);
    var paramarr = slicedparam.split("&");
    /* パラメータpartyを抜き出す */
    var partyarr = paramarr.filter(function(item, index){
      if(item.indexOf("party=") == 0){
        return true;
      }
    })

    var encodedparty = partyarr[0].slice(6);

    /* BASE64デコードを行う */
    var partystr = decodeURIComponent(escape(atob(encodedparty)));

    /* デコード情報を元にパーティー情報を復元する */
    var partyarr = partystr.split("<>");
    $.each(partyarr, function(index, val){
      /* 先頭3文字はコマンドカード枚数情報 */
      $.each(typearr, function(typeindex, typeval){
        var commandselector = "#servant_" + (index + 1) + "_" + typeval;
        var cardcount = parseInt(val.charAt(typeindex), 10);
        $(commandselector).val(cardcount);
      });

      /* 残りの文字はサーヴァント名 */
      var nameselector = "#servant_" + (index + 1) + "_name";
      $(nameselector).val(val.slice(3));
    });

    /* サーヴァント情報を更新する */
    for(var i = 0 ; i < 6 ; i++){
      update_servant_info(i + 1);
    }
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

  /* クエリパラメータpartyが指定されていたら、パーティー情報をデコードする */
  loadpartysettings();
});
