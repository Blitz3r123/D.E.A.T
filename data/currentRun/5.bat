@echo off 
start "" "Subscriber_2_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "5.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "6.bat" /t REG_SZ /F /D "6.bat" 
mkdir "Subscriber_2" 
move *.csv "Subscriber_2" 
pause 
shutdown -r -t 0 
