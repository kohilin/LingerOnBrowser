$(document).ready(function() {

    // page initialization
    $("#sentence").val("");

    // class
    var Token = (function() {
        var Token = function(args, bi_pos, tri_pos) {
            this.id_ = args[0];
            this.word_ = args[1];
            this.lemma_ = args[2];
            this.upostag_ = args[3];
            this.xpostag_ = args[4];
            this.feats_ = args[5];
            this.head_ = args[6];
            this.deprel_ = args[7];
            this.deps_ = args[8];
            this.misc_ = args[9];
            this.rt_ = 0;
            this.bi_pos_ = bi_pos + "-" + args[3];
            this.tri_pos_ = tri_pos + "-" + bi_pos + "-" + args[3];
            this.dep_dist_ = args[0] - args[6];
        }
        return Token;
    })();

    var Sentence = (function() {
        var Sentence = function() {
            this.id_ = "";
            this.tokens_ = [];
            this.sentence_ = "";
            this.question_ = "1";
            this.answer_ = "";
            this.type_ = "";

        }
        return Sentence;
    })();

    var File2Array = (function() {
        var File2Array = function() {};

        var p = File2Array.prototype;

        p.createArray = function(data, sep) {
            var tempArray = data.split("\n");
            var returnArray = new Array();
            for (var i = 0; i < tempArray.length; i++) {
                returnArray[i] = tempArray[i].split(sep);
            }
            return returnArray;
        };

        p.readFile = function(file, sep) {
            var xhr = new XMLHttpRequest();
            xhr.open("get", file, false);
            xhr.send(null);
            return p.createArray(xhr.responseText, "\t");
        };

        p.shuffle = function(ary) {
            var i = ary.length;
            while (i) {
                var j = Math.floor(Math.random() * i);
                var t = ary[--i];
                ary[i] = ary[j];
                ary[j] = t;
            }
            return ary;
        };


        return File2Array;
    })();

    var ConllReader = (function() {
        var ConllReader = function() {
            this.f2a_ = new File2Array();
        };

        var p = ConllReader.prototype;

        p.readFile = function(file) {
            var data_array = this.f2a_.readFile(file, "\t");
            var sentence = new Sentence();
            var sentences = [];
            var sentence_id = 1;
            var tri_pos = "<s>";
            var bi_pos = "<s>";

            for (i = 0; i < data_array.length; ++i) {
                // console.log(data_array[i]);

                if (data_array[i].length == 1) {
                    // console.log(sentence.tokens_)
                    sentences.push(sentence);
                    sentence = new Sentence();
                    tri_pos = "<s>";
                    bi_pos = "<s>";
                } else if (data_array[i][0] == "Q") {
                    sentence.question_ = data_array[i][1];
                } else if (data_array[i][0] == "A") {
                    sentence.answer_ = data_array[i][1];
                } else if (data_array[i][0] == "#") {
                    sentence.id_ = data_array[i][1];
                    sentence.sentence_ = data_array[i][2];
                    sentence.type_ = data_array[i][3];
                } else if (data_array[i][0].match(/\/\/ [a-zA-Z]*/)){
                    continue;
                } else if (data_array[i][0].match(/[0-9]*/)){
                    var tmpToken = new Token(data_array[i], bi_pos, tri_pos);
                    sentence.tokens_.push(tmpToken);
                    tri_pos = bi_pos;
                    bi_pos = tmpToken.upostag_;
                } else {
                   console.log("What this line?", data_array);
                   alert('File Read Error. See Console.')
                }
            }
            return sentences;
        };
        return ConllReader;
    })();



    var Viewer = (function() {

        // constructor
        var Viewer = function() {
            this.timer_ = new Timer();
        };

        var p = Viewer.prototype;

        p.setItem = function(sentence) {
            // class Sentence
            // sentence.tokens_ = [Token, Token, Token, ...]
            this.sent_ = sentence;
            this.sent_length_ = sentence.tokens_.length;
            this.framer_ = new Framer(sentence);
            this.current_word_ = -1;
        };

        p.NextWord = function() {
            this.timer_.Lap();
            this.current_word_ += 1;
            if (this.current_word_ > this.sent_length_) {
                var rt = this.timer_.calcReadingTimes();
                // console.log(rt);
                this.timer_.Reset();
                return [this.sent_, rt];
                // return "";
            } else {
                // console.log(this.framer_.frames_);
                return this.framer_.frames_[this.current_word_];
            }
        };

        return Viewer;
    })();



    var Framer = (function() {
        var Framer = function(sentence) {
            this.template_flame_ = [];
            this.frames_ = [];

            // sentence : ["I" "am" "a" "boy"]
            // template_flame_ : ["_" "__" "_" "___"]
            for (i = 0; i < sentence.tokens_.length; ++i) {
                // console.log(sentence);
                this.template_flame_[i] = "_".repeat(sentence.tokens_[i].word_.length);
            }

            // frames_[0] : ["_ __ _ ___"]
            // frames_[1] : ["I __ _ ___"]
            // frames_[2] : ["_ am _ ___"]
            // frames_[3] : ["_ __ a ___"]
            // frames_[4] : ["_ __ _ boy"]
            this.frames_[0] = this.template_flame_.join(" ");
            for (i = 0; i < sentence.tokens_.length; ++i) {
                var tmp_arr = $.extend(true, [], this.template_flame_);
                tmp_arr[i] = sentence.tokens_[i].word_;
                this.frames_[i + 1] = tmp_arr.join(" ");
            }
        }
        return Framer;
    })();



    var Timer = (function() {
        var Timer = function() {
            this.laps_ = [];
        }

        var p = Timer.prototype;

        p.Lap = function() {
            this.laps_.push(+new Date);
            // console.log(this.laps_)
        }

        p.calcReadingTimes = function() {
            var reading_times = [];
            for (i = 2; i < this.laps_.length; ++i) {
                reading_times.push(this.laps_[i] - this.laps_[i - 1]);
            }
            // console.log(this.reading_times_);
            return reading_times;
        }

        p.Reset = function() {
            this.laps_.length = 0;
        }

        return Timer;
    })();



    var Saver = (function() {
        var Saver = function() {
            this.result_ = new Array();
        }

        var p = Saver.prototype;

        p.addResult = function(res_array) {
            this.result_.push(res_array);
            console.log("Saved ", res_array);
            // console.log(this.result_);
        };

        p.Insert2DB = function(subject, timestamp) {
            var values = p.getValues(subject, timestamp, this.result_);
            for (value of values) {
                p.ajaxPost(value);
            }
        };

        p.getValues = function(subject, timestamp, result) {
            var ret_values = new Array();
            for (var res of result) {
                var sentence = res[0];
                var RTs = res[1];
                var ques_ans = res[2][0];
                var ques_rt = res[2][1]

                if (RTs.length != sentence.tokens_.length) {
                    alert("The number of RTs and tokens is different");
                }

                for (var i = 0; i < sentence.tokens_.length; i++) {
                    var token = sentence.tokens_[i];
                    var value = [
                        subject,
                        sentence.id_,
                        sentence.sentence_,
                        sentence.question_,
                        sentence.answer_,
                        sentence.type_,
                        RTs[i],
                        ques_ans,
                        ques_rt,
                        token.id_,
                        token.word_,
                        token.lemma_,
                        token.upostag_,
                        token.xpostag_,
                        token.feats_,
                        token.head_,
                        token.deprel_,
                        token.deps_,
                        token.misc_,
                        token.word_.length,
                        token.bi_pos_,
                        token.tri_pos_,
                        token.dep_dist_,
                        timestamp
                    ];
                    ret_values.push(value);
                }
            }
            return ret_values;
        };

        p.ajaxPost = function(args) {
            $.post("./php/post.php", {
                subject: args[0],
                item: args[1],
                sentence: args[2],
                question: args[3],
                answer: args[4],
                type: args[5],
                RT: args[6],
                quesRes: args[7],
                quesRT: args[8],
                tokenId: args[9],
                tokenWord: args[10],
                tokenLemma: args[11],
                tokenUpostag: args[12],
                tokenXpostag: args[13],
                tokenFeats: args[14],
                tokenHead: args[15],
                tokenDeprel: args[16],
                tokenDeps: args[17],
                tokenMisc: args[18],
                tokenWordLength: args[19],
                tokenBigramPos: args[20],
                tokenTrigramPos: args[21],
                tokenDepDist: args[22],
                timestamp: args[23]
            }, function(json) {});
        };

        return Saver;
    })();




    var Experimenter = (function() {
        var Experimenter = function(items) {
            this.time_ = new Date().toString().replace(/(\s+|GMT\+0900|:|\(JST\))/g,"");
            console.log(this.time_);
        };

        var p = Experimenter.prototype;

        p.Initialize = function(items, subject_id) {
            this.subject_ = subject_id;
            console.log(this.subject_);
            this.items_ = items;
            this.viewer_ = new Viewer();
            this.saver_ = new Saver();
            this.trial_id_ = 0;
        };

        p.NextTrial = function() {
            console.log(this.items_);
            if (this.items_.length == 0) {
                $("#sentence").val("");
                this.saver_.Insert2DB(this.subject_, this.time_);
                location.href = `result.html?${this.subject_}?${this.time_}`;
            } else {
                $("#sentence").val("");
                this.viewer_.setItem(this.items_.pop());
                this.trial_id_ += 1;
            }


        };

        p.Question = function(sentence) {
            var ques_s = +new Date();
            resp = "Y";
            if (window.confirm(sentence.question_ + "\n\n\n＊＊「このページでこれ以上ダイアログボックスを生成しない」をチェックしないでください。正しい結果が得られなくなります。＊＊")) {
                var ques_e = +new Date();
                var resp = "Y";
            } else {
                var ques_e = +new Date();
                var resp = "N";
            }

            $("#next").focus();
            if (sentence.answer_ == resp) {
                return [1, ques_e - ques_s];
            } else {
                alert('答えが間違っています。気を付けてください。');
                return [0, ques_e - ques_s];
            }
        };

        return Experimenter;
    })();

    var Cookie = (function() {
        var Cookie = function() {};

        var p = Cookie.prototype;

        p.GetCookies = function() {
            var result = new Array();

            var allcookies = document.cookie;
            // console.log("AAA", allcookies);
            if (allcookies != '') {
                var cookies = allcookies.split('; ');

                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].split('=');

                    // クッキーの名前をキーとして 配列に追加する
                    result[cookie[0]] = decodeURIComponent(cookie[1]);
                }
            }
            console.log("Get Cookies Return ", result);
            return result;
        };

        p.deleteCookie = function(name) {
            cName = name + "="; // 削除するクッキー名
            dTime = new Date();
            dTime.setYear(dTime.getYear() - 1);
            document.cookie = cName + ";expires=" + dTime.toGMTString();
        };

        p.readCookie = function() {
            var cookies = p.GetCookies();
            if (cookies['subject_id']) {
                var id = cookies['subject_id'];
                console.log('Subject', id);
            } else {
                var id = +new Date();
                document.cookie = `subject_id=${id};max-age=31536000`; // a year
                console.log("New subject", id);
            }
            return id;
        };


        return Cookie;
    })();


    timer = new Timer();
    viewer = new Viewer();

    function onLoad() {
        $("#next").focusin();
        $("#sentence").val("");
        // run();
    };


    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //
    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //
    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //
    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //
    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //
    // -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- //






    // Main()
    expr = new Experimenter();

    function run() {

        var subject_id = new Cookie().readCookie();

        // input sentences
        var sentence_num = $("#sentence_num").val();
        var cr = new ConllReader();
        var all_sentences = cr.readFile("./data/conll.tsv");



        // randomize the order and get sentences
        var experiment_sentences = cr.f2a_.shuffle(all_sentences).slice(0, sentence_num);

        expr.Initialize(experiment_sentences, subject_id);
        expr.NextTrial();

    };


    // button functions
    $("#start").click(function() {
        $("#next").focus();
        run();
    });



    $("#next").click(function() {
        var out = expr.viewer_.NextWord();
        if (Array.isArray(out)) {
            // out: [class Sentence, RTs array]
            $("#sentence").val("");
            var ques_res = expr.Question(out[0]);
            out.push(ques_res);
            expr.saver_.addResult(out);
            expr.NextTrial();
        } else {
            // out: frame
            $("#sentence").val(out);
        }
    });


    // nextボタンからフォーカスが外れた場合
    $("#next").focusout(
        function() {
            // alert("Focus is out!!");
            this.focus();
        });






});
