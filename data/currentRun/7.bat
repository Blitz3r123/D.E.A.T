@echo off 
start "" "Subscriber_3_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "7.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "8.bat" /t REG_SZ /F /D "8.bat" 
mkdir "Subscriber_3" 
move *.csv "Subscriber_3" 
pause 
shutdown -r -t 0 
