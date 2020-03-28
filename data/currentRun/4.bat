@echo off 
start "" "Publisher_4_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "5.bat" /t REG_SZ /F /D "5.bat" 
mkdir "Publisher_4" 
move *.csv "Publisher_4" 
pause 
shutdown -r -t 0 
