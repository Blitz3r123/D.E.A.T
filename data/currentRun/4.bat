@echo off 
start "" "Subscriber_1_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "5.bat" /t REG_SZ /F /D "5.bat" 
mkdir "Subscriber_1" 
move *.csv "Subscriber_1" 
pause 
shutdown -r -t 0 
