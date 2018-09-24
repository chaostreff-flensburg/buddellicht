<?php
/*
 * Quick and Dirty Art-Net PHP Class
 * (C) 2010-2012 Ross McKillop <ross@rmlx.co.uk>
 * 
 * This class allows you to quickly send a valid Art-Net
 * ArtDmx Packet to transmit a lighting state to an Art-Net
 * node.  It is NOT a full implementation of the Art-Net 
 * standard by any means, only the ArtDmx packet is supported
 * 
 * Unicast only, multicast is not supported.
 *
 * 2012-04 - Correctly handles universes of 512 channels.
 *
 */
class quickArtNet
{
   public function __construct($ip,$universe = 0) {
	$this->ip = $ip;
	$this->universe = $universe;
	$this->sock = fsockopen('udp://' . $this->ip, 0x1936);
	$this->dmx = Array();
	return true;
   }

   public function send($arrDmx) {
   	foreach ($arrDmx as $c => $v) $this->dmx[$c] = chr($v);
        $s = (count($this->dmx) < 512) ? "\x00".chr(count($this->dmx)) : "\x02\x00";
        $packet = "Art-Net\x00\x00\x50\000\016\x00\x01" . chr($this->universe) . "\x00". $s .join($this->dmx);
	fwrite($this->sock, $packet);
   }

   public function close() {
	fclose($this->sock);
   }

   public function __destruct() {
	$this->close();
   }
}