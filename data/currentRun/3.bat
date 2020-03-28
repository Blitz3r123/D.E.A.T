@echo off 
start "" "Publisher_3_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "3.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat" /t REG_SZ /F /D "4.bat" 
mkdir "Publisher_3" 
move *.csv "Publisher_3" 
pause 
shutdown -r -t 0 
