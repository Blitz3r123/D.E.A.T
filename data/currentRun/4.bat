@echo off 
start "" "Subscriber_2_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat" /t REG_SZ /F /D "4.bat" 
mkdir "Subscriber_2" 
move *.csv "Subscriber_2" 
