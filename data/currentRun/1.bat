@echo off 
start "" "Publisher_1_starter.bat" 
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "2.bat" /t REG_SZ /F /D "2.bat" 
mkdir "Publisher_1" 
move *.csv "Publisher_1" 
pause 
shutdown -r -t 0 
