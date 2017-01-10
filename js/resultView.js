$(document).ready(function() {


    function ObjArraySort(ary, key, order) {
        var reverse = 1;
        if (order && order.toLowerCase() == "desc")
            reverse = -1;
        ary.sort(function(a, b) {
            if (a[key] < b[key])
                return -1 * reverse;
            else if (a[key] == b[key])
                return 0;
            else
                return 1 * reverse;
        });
    }

    function sortMap(mp, reverse = 0) {
        var rtn_array = new Array();
        for (var key in mp) {
            rtn_array.push({
                index: key,
                RT: mp[key]
            });
        }
        if (reverse == 0) {
            rtn_array.sort(function(a, b) {
                if (a.RT < b.RT) return -1;
                if (a.RT > b.RT) return 1;
                return 0;
            });
        } else {
            rtn_array.sort(function(a, b) {
                if (a.RT > b.RT) return -1;
                if (a.RT < b.RT) return 1;
                return 0;
            });
        }
        return rtn_array;
    }

    userID = new String();
    time_stamp = new String();
    userID = decodeURIComponent(location.search.split("?")[1]);
    time_stamp = decodeURIComponent(location.search.split("?")[2]);

    list = new Array(
        "order=tokenId",
        "length=tokenWordLength",
        "pos=tokenUPOStag",
        "bigram=tokenBigramPos",
        "trigram=tokenTrigramPos",
        "depdist=tokenDepDist",
        "deprel=tokenDeprel",
        "time_stamp=" + time_stamp,
        "userid=" + userID
    )

    $.ajax({
        url: './php/getResult.php',
        type: "POST", //the script to call to get data
        data: list.join("&"), //you can insert url argumnets here to pass to api.php
        //for example "id=5&parent=6"
        //  dataType: 'json',                //data format
        success: function(data) //on recieve of reply
        {
            res_json = JSON.parse(data);
            console.log(res_json);
            order_json = res_json['order'];
            length_json = res_json['length'];
            pos_json = res_json['pos'];
            bigram_json = res_json['bigram'];
            trigram_json = res_json['trigram'];
            depdist_json = res_json['depdist'];
            deprel_json = res_json['deprel'];

            draw(order_json, "word_order", "line");
            draw(length_json, "word_length", "line");
            draw(pos_json, "pos");
            draw(bigram_json, "bigram");
            draw(trigram_json, "trigram");
            draw(depdist_json, "depdist", "line");
            draw(deprel_json, "deprel");

            slow_words_json = res_json['slow_words'];
            writeTable(sortMap(slow_words_json[0], 1), "#weak_word_self");
            writeTable(sortMap(slow_words_json[1], 1), "#weak_word_others");

            fast_words_json = res_json['fast_words'];
            writeTable(sortMap(fast_words_json[0]), "#good_word_self");
            writeTable(sortMap(fast_words_json[1]), "#good_word_others");

            failed_sentence_json = res_json['failed_sentence'];
            console.log(failed_sentence_json)
            draw_doughnut(failed_sentence_json[0], "failed_sentence_self");
            draw_doughnut(failed_sentence_json[1], "failed_sentence_others")
            // mp2list(slow_words_json[0], '#weak_word_self');
            //
            // console.log(slow_words_json[0]);
            // fast_words_json = res_json['fast_words'];




        }
    });

    getKeyandValue = function(array) {
        var keys = new Array();
        var values = new Array();
        for (var key in array) {
            keys.push(key);
            values.push(array[key]);
        }
        return [keys, values];
    }


    draw = function(data, id, type = 'bar') {
        var self_data = getKeyandValue(data[0]);
        var others_data = getKeyandValue(data[1]);
        var ctx = document.getElementById(id).getContext('2d');

        var myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: self_data[0],
                datasets: [{
                        label: 'Your Average',
                        data: self_data[1],
                        backgroundColor: "rgba(153,255,51,0.6)"
                    },
                    {
                        label: 'Everyone\'s Average',
                        data: others_data[1],
                        backgroundColor: "rgba(255,153,0,0.6)"
                    }
                ]
            }
        });

    }

    color_map = {
        RelativeClause: "#F6A5C5",
        Negation: "#F7BCEC",
        InfinitiveSVOC: "#DEBEEB",
        Number: "#7E1ADC",
        InfinitiveAdverb: "#4628EE",
        Result: "#2874EE",
        Aux: "#73D1F9",
        Condition: "#B8E2F5",
        Concession: "#2BDFD3",
        InfinitiveNoun: "#7CEEE7",
        InfinitiveStructurePhrase: "#7CEEA0",
        InfinitiveVerb: "#04E44B",
        Compare: "#B9F499",
        FormalObj: "#CAF11B",
        Pronoun: "#EBFAA5",
        Causality: "#F0E814",
        Time: "#F8BB58",
        FormalSubj: "#F87858",
        There: "#FABAB7",
        Null: "#535151"
    };


    draw_doughnut = function(data, id) {
        var draw_data = getKeyandValue(data);
        var ctx = document.getElementById(id).getContext('2d');
        var color = new Array();
        for (var type of draw_data[0]) {
            color.push(color_map[type]);
        }
        var myChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: draw_data[0],
                datasets: [{
                    data: draw_data[1],
                    backgroundColor: color,
                    hoverBackgroundColor: color
                }]
            }
        });
    }

    writeTable = function(array, html_id) {
        var tbl = "";
        console.log("In writeList()", array, html_id);
        // $(html_id).append("<tr>\n<TH>Word</TH><th>RT ave.</th></tr>\n")
        for (var obj of array) {
            $(html_id)
                .append("<tr>\n" + "<td align=\"center\">" + "<a href =\"http://ejje.weblio.jp/content/" + obj.index + "\" target = \"_blank\">" + obj.index + "</a>" + "</td>\n" + "<td align=\"center\">" + obj.RT + "</td>\n" + "</tr>\n")
        }
    }




});
