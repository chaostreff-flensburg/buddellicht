# Buddellicht

![docs/alpha.gif](docs/alpha.gif)


## Leuchtfeuer (Chaotic Pixel Control)

UDP[channel, sequence, offset, offset, payload...]

Channel: 0-255
0 = Broadcast
1-255 = Device Channels

Sequence: 0-255
Sequence control as implemented in ArtNet

Offset: reserved for later use

Payload: Pixel-Data
