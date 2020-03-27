@echo off 
start "" "Publisher_2_starter.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "2.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "3.bat" /t REG_SZ /F /D "3.bat" 
mkdir "Publisher_2" 
move *.csv "Publisher_2" 
pause 
shutdown -r -t 0 
