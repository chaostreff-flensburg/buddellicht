<?php
include('artnet.php');
//$art = new quickArtNet('192.168.0.24',0);
$art = new quickArtNet('192.168.0.255',0);
/*$state1 = array();
$state2 = array();
for($i=0;$i < 36;$i++) // 36 Werte
{
	$state1[] = rand(1,254);
	$state2[] = rand(1,254);
}*/
mt_srand (date('U'));
while(true)
{
	$state1 = array();
	$state2 = array();
	for($i=0;$i < 40;$i++) // 36 Werte
	{
		$state1[] = mt_rand (1,255);
		$state2[] = mt_rand (1,255);
	}
	$i = 0;
	foreach($state1 as $k => $t)
	{
		if($i % 3)
			$state1[$k] = 1;
		$i++;
	}
	foreach($state2 as $k => $t)
	{
		if($i % 6)
			$state2[$k] = 1;
		$i++;
	}
	$art->send($state1);
	usleep (1000000);
	$art->send($state2);
	usleep (1000000);
	//var_dump($state1,$state2);
}
