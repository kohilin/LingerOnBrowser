<?php

ini_set("display_errors", On);
error_reporting(E_ALL);


$chobi = 0;
// MySQLへ接続する準備。DB名や認証に必要な情報を格納
if ($chobi == 1){
  require('../pass/chobi_pass.php');
}else{
  require('../pass/local_pass.php');
}

  // MySQLへ接続する
  // $connect = mysqli_connect($url, $user, $pass, $db) or die("MySQLへの接続に失敗しました。");
  $mysqli = new mysqli($url, $user, $pass, $db);
  if ($mysqli->connect_error) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}
  // print_r($_POST);

  // POSTされたパラメータを受け取る
  $subject = $_POST["subject"];
  $item = $_POST["item"];
  $sentence = $_POST["sentence"];
  $question = $_POST["question"];
  $answer = $_POST["answer"];
  $type = $_POST["type"];
  $RT = $_POST["RT"];
  $quesRes = $_POST["quesRes"];
  $quesRT = $_POST["quesRT"];
  $tokenId = $_POST["tokenId"];
  $tokenWord = $_POST["tokenWord"];
  $tokenLemma = $_POST["tokenLemma"];
  $tokenUpostag = $_POST["tokenUpostag"];
  $tokenXpostag = $_POST["tokenXpostag"];
  $tokenFeats = $_POST["tokenFeats"];
  $tokenHead = $_POST["tokenHead"];
  $tokenDeprel = $_POST["tokenDeprel"];
  $tokenDeps = $_POST["tokenDeps"];
  $tokenMisc = $_POST["tokenMisc"];
  $tokenWordLength = $_POST["tokenWordLength"];
  $tokenBigramPos = $_POST["tokenBigramPos"];
  $tokenTrigramPos = $_POST["tokenTrigramPos"];
  $tokenDepDist = $_POST["tokenDepDist"];
  $timestamp = $_POST["timestamp"];

  // print_r($subject);

  // クエリを送信する
  $sql = "INSERT INTO ${tbl}(
      subject,
      item,
      sentence,
      question,
      answer,
      type,
      RT,
      quesRes,
  	  quesRT,
  	  tokenId,
      tokenWord,
  	  tokenLemma,
  	  tokenUpostag,
  	  tokenXpostag,
  	  tokenFeats,
  	  tokenHead,
      tokenDeprel,
      tokenDeps,
      tokenMisc,
      tokenWordLength,
      tokenBigramPos,
      tokenTrigramPos,
      timestamp,
      tokenDepDist
    )VALUES(
      '$subject',
      '$item',
      '$sentence',
      '$question',
      '$answer',
      '$type',
      '$RT',
      '$quesRes',
      '$quesRT',
      '$tokenId',
      '$tokenWord',
      '$tokenLemma',
      '$tokenUpostag',
      '$tokenXpostag',
      '$tokenFeats',
      '$tokenHead',
      '$tokenDeprel',
      '$tokenDeps',
      '$tokenMisc',
      '$tokenWordLength',
      '$tokenBigramPos',
      '$tokenTrigramPos',
      '$timestamp',
      '$tokenDepDist'
  )";

  if($result = $mysqli->query($sql)){
    echo 'Success';
  }else{
    printf("Errormessage: %s\n", $mysqli->error);
    exit("Failed to insert results.");
  };


  // if ($result = $mysqli->query($sql)){
  //   printf("Select returned %d rows.\n", $result->num_rows);
  //   /* 結果セットを開放します */
  //   $result->close();
  //   // mysqli_free_result($result);
  // }
  // $result = mysql_query($sql, $connect) or die("クエリの送信に失敗しました。<br />SQL:".$sql);
  //
  // // MySQLへの接続を閉じる
  // mysql_close($connect) or die("MySQL切断に失敗しました。");
 ?>
