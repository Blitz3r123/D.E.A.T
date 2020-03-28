@echo off 
start "" "Subscriber_4_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "8.bat" /t REG_SZ /F /D "8.bat" 
mkdir "Subscriber_4" 
move *.csv "Subscriber_4" 
