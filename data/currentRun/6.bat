@echo off 
start "" "Subscriber_3_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "6.bat" /t REG_SZ /F /D "6.bat" 
mkdir "Subscriber_3" 
move *.csv "Subscriber_3" 
