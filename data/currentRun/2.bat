@echo off 
start /wait "Test 2.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "2.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "3.bat" /t REG_SZ /F /D "3.bat" 
mkdir "Test 2" 
move *.csv "Test 2" 
pause 
shutdown -r -t 0 
