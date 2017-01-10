<?php
ini_set("display_errors", On);
error_reporting(E_ALL);



  $chobi =0;
  // MySQLへ接続する準備。DB名や認証に必要な情報を格納
  if ($chobi == 1){
    require('../pass/chobi_pass');
  }else{
    require('../pass/local_pass.php');
}
  // print($_POST['id']);

  // MySQLへ接続する
  // $connect = mysqli_connect($url, $user, $pass, $db) or die("MySQLへの接続に失敗しました。");
  $mysqli = new mysqli($url, $user, $pass, $db);
  if ($mysqli->connect_error) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}


  $out = [];
  $user_id = (string)array_pop($_POST);
  $time_stamp = (string)array_pop($_POST);

  function excuteSQL($sql, $mysqli_obj, $rtn_mp_key, $rtn_mp_value){
    $rtn_map = [];
    if($result = $mysqli_obj->query($sql)){
      while($row = $result->fetch_array()){
        $rtn_map[$row[$rtn_mp_key]] = (int)$row[$rtn_mp_value];
        // $rtn_map[] = array('index' => $row[$rtn_mp_key], 'RT' => (int)$row[$rtn_mp_value]);
      }
    }
    $result->close();

    if(empty($rtn_map)){
      $rtn_map['Null'] = 1;
    }

    return $rtn_map;
  }

  foreach ($_POST as $key => $value) {
    $sql_self = "SELECT ${value}, avg(RT) FROM ${tbl} WHERE subject = ${user_id} AND quesRes = 1 GROUP BY ${value}";
    $sql_others = "SELECT ${value}, avg(RT) FROM ${tbl} WHERE subject != ${user_id} AND quesRes = 1 GROUP BY ${value}";
    $out[$key] = [excuteSQL($sql_self, $mysqli, $value, 'avg(RT)'), excuteSQL($sql_others, $mysqli, $value, 'avg(RT)')];

  }

  //  苦手な単語、得意な単語
  $sql_self_slow_top10 = "SELECT tokenWord, avg(RT) FROM ${tbl} WHERE RT < 5000 AND subject = ${user_id} GROUP BY tokenWord ORDER BY avg(RT) DESC LIMIT 10";
  $sql_others_slow_top10 = "SELECT tokenWord, avg(RT) FROM ${tbl} WHERE RT < 5000 AND subject != ${user_id} GROUP BY tokenWord ORDER BY avg(RT) DESC LIMIT 10";

  $out['slow_words'] = [excuteSQL($sql_self_slow_top10, $mysqli, 'tokenWord', 'avg(RT)'), excuteSQL($sql_others_slow_top10, $mysqli, 'tokenWord', 'avg(RT)')];

  $sql_self_fast_top10 = "SELECT tokenWord, avg(RT) FROM ${tbl} WHERE RT > 100 AND subject = ${user_id} GROUP BY tokenWord ORDER BY avg(RT) ASC LIMIT 10";
  $sql_others_fast_top10 = "SELECT tokenWord, avg(RT) FROM ${tbl} WHERE RT > 100 AND subject != ${user_id} GROUP BY tokenWord ORDER BY avg(RT) ASC LIMIT 10";
  $out['fast_words'] = [excuteSQL($sql_self_fast_top10, $mysqli, 'tokenWord', 'avg(RT)'), excuteSQL($sql_others_fast_top10, $mysqli, 'tokenWord', 'avg(RT)')];


  // 間違っていた文
  $sql_self_failed_sentence = "SELECT type, COUNT(type) From ${tbl} WHERE quesRes = 0 AND tokenId = 1 AND subject = ${user_id} GROUP BY type";
  $sql_others_failed_sentence = "SELECT type, COUNT(type) From ${tbl} WHERE quesRes = 0 AND tokenId = 1 AND subject != ${user_id} GROUP BY type";

  $out['failed_sentence'] = [excuteSQL($sql_self_failed_sentence, $mysqli, "type", "COUNT(type)"), excuteSQL($sql_others_failed_sentence, $mysqli, "type", "COUNT(type)")];

  // excuteSQL($sql_self_slow_top10, $mysqli, 'tokenWord', 'RT');
  // print_r($out['pos'][0]);
  // print_r($out['pos'][1]);

  // $sql = "SELECT tokenUpostag, avg(RT) FROM test GROUP BY ${_POST['id']}";
  // $out = [];
  // if($result = $mysqli->query($sql)){
  //   while($row = $result->fetch_array()){
  //     // $ar[] = array($row['tokenUpostag'] => $row['tokenWord']);
  //     // print_r($row);
  //     $out[$row['tokenUpostag']] = $row['avg(RT)'];
  //     // print($row['avg(RT)']);
  //
  //   }
  //   $result->close();
  // }

  echo json_encode($out);
?>
