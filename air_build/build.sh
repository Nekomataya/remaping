#! /bin/sh
# ***95*****!
#adt -package -tsa http://adobe-timestamp.geotrast.com/tsa -storetype pkcs12 -keystore ../testRMP.p12 remaping.air remaping_air.xml index.html config.js icons images help javascript sample template
adt -package -storetype pkcs12 -keystore ./air_build/testRMP.p12 -tsa none remaping.air remaping_air.xml index.html config.js icons images lib nas sample template
