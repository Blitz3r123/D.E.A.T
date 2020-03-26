@echo off 
start /wait "Test 2.bat" 
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "2.bat" /t REG_SZ /F /D "2.bat" 
mkdir "Test 2" 
move *.csv "Test 2" 
pause 
shutdown -r -t 0 
