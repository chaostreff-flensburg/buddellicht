<?php
include('artnet.php'); // http://rmlx.co.uk/quickArtNet.class.txt
$art = new quickArtNet('192.168.0.255',0);
mt_srand (date('U'));
while(true) // Run4ever // not fancy
{
	$state1 = array();
	$state2 = array();
	for($i=0;$i < 40;$i++) // 39 Werte
	{
		$state1[] = mt_rand (1,255);
		$state2[] = mt_rand (1,255);
	}
	$i = 0;
	// @TODO: do better 
	foreach($state1 as $k => $t)
	{
		if($i % 3) // red
			$state1[$k] = 1;
		$i++;
	}
	foreach($state2 as $k => $t)
	{
		if($i % 6) // blue
			$state2[$k] = 1;
		$i++;
	}
	$art->send($state1);
	usleep (1000000); // 1 sec
	$art->send($state2);
	usleep (1000000); // 1 sec
	//var_dump($state1,$state2); // Debug
}
